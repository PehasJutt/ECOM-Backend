import Agenda from 'agenda';
import moment from 'moment';

import { Orders, DashboardStats } from '../models';

const agenda =  new Agenda({ db: { address: 'mongodb://localhost:27017/backend',
  collection:'agendaJobs' }  }); 

agenda.define('DashboardJob', async (job, done) => {
  const JOB_STATES = {
    COMPLETED: '_COMPLETED_',
    FAILED: '_FAILED_',
    IN_PROGRESS: '_IN_PROGRESS_',
    STARTED: '_STARTED_',
    RETRY: '_RETRY_'
  };

  console.log('*********************************************************');
  console.log('*********  Create Dashboard Stats Job Started   *********');
  console.log('*********************************************************');

  job.attrs.state = JOB_STATES.STARTED;
  job.attrs.progress = 0;
  await job.save();

  const { type } = job.attrs.data;
  console.log('\n\n', { type });

  try {
    job.attrs.state = JOB_STATES.IN_PROGRESS;
    job.attrs.progress = 25;
    await job.save();

    let startDate = moment().startOf('day').toDate();
    let endDate = moment().endOf('day').toDate();
    const todayStats = await Orders.aggregate([{
      $match: {
        createdOn: { $gte: startDate,
          $lte: endDate }
      }
    }, {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalAmount: { $sum: '$total' },
        totalProducts: { $sum: { $size: '$cartItems.prodId' } },
        totalUnits: { $sum: { $sum: '$cartItems.qty' } },
      }
    }]);
    console.log('\n\n', { todayStats });

    job.attrs.progress = 50;
    await job.save();

    startDate = moment().subtract(7, 'days').toDate();
    endDate = moment().toDate();
    const sevenDayStats = await Orders.aggregate([{
      $match: {
        createdOn: { $gte: startDate,
          $lte: endDate }
      }
    }, {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalAmount: { $sum: '$total' },
        totalProducts: { $sum: { $size: '$cartItems.prodId' } },
        totalUnits: { $sum: { $sum: '$cartItems.qty' } },
      }
    }]);
    console.log('\n\n', { sevenDayStats });

    job.attrs.progress = 75;
    await job.save();

    startDate = moment().subtract(30, 'days').toDate();
    endDate = moment().toDate();
    const thirtyDayStats = await Orders.aggregate([{
      $match: {
        createdOn: {
          $gte: startDate,
          $lte: endDate
        }
      }
    }, {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalAmount: { $sum: '$total' },
        totalProducts: { $sum: { $size: '$cartItems.prodId' } },
        totalUnits: { $sum: { $sum: '$cartItems.qty' } },
      }
    }]);
    
    job.attrs.lockedAt = null;
    job.attrs.state = JOB_STATES.COMPLETED;
    job.attrs.progress = 100;
    await job.save();

    const currentYear = new Date().getFullYear();
    const monthlySummary = await Orders.aggregate([
      {
        $match: {
          $expr: {
            $eq: [{ $year: '$createdOn' }, currentYear]
          }
        }
      },
      {
        $group: {
          _id: { $month: '$createdOn' },
          totalOrders: { $sum: 1 },
          totalAmount: { $sum: '$total' }
        }
      }
    ]);

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    const result = months.map((month, index) => {
      const monthData = monthlySummary.find((data) => data._id === index + 1);

      return {
        name: month,
        totalOrders: monthData ? monthData.totalOrders : 0,
        totalAmount: monthData ? monthData.totalAmount : 0,
      };
    });

    job.attrs.lockedAt = null;
    // job.attrs.state = JOB_STATES.COMPLETED;
    await job.save();

    const totalOrders = await Orders.countDocuments();
    const totalUnits = await Orders.aggregate([{
      $unwind: '$cartItems' 
    },{
      $group: {
        _id: null,
        totalUnits: { $sum: '$cartItems.qty' }
      }
    },{
      $project: {
        _id: 0,
        totalUnits: 1
      }
    }]);

    const [totalAmount] = await Orders.aggregate([{
      $group: {
        _id: null,
        totalAmount: {
          $sum: '$total',
        },
      }
    }]);

    const summary = {
      totalOrders,
      totalUnits: totalUnits[0].totalUnits,
      totalAmount: totalAmount.totalAmount
    };

    job.attrs.lockedAt = null;
    // job.attrs.state = JOB_STATES.COMPLETED;
    await job.save();

    const products = await Orders.aggregate([{
      $unwind: '$cartItems' 
    },{
      $group: {
        _id: '$cartItems.prodId',
        totalQty: { $sum: '$cartItems.qty' }
      }
    },{
      $sort: { totalQty: -1 } 
    },{
      $lookup: {
        from: 'products', 
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },{
      $unwind: '$product' 
    },{
      $project: {
        _id: 0,
        product: 1,
        qty: '$totalQty'
      }
    },{
      $limit: 10
    }]);
  
    job.attrs.lockedAt = null;
    job.attrs.state = JOB_STATES.COMPLETED;
    await job.save();

    await DashboardStats.updateOne({}, {
      $set: {
        todayStats: todayStats?.length > 0 ? todayStats[0] : null,
        sevenDayStats: sevenDayStats?.length > 0 ? sevenDayStats[0] : null,
        thirtyDayStats: thirtyDayStats?.length > 0 ? thirtyDayStats[0] : null,
        annualStats: result,
        orderStats: summary,
        topSellingProds: products
      }
    }, {
      upsert: true
    });

    console.log('*********************************************************');
    console.log('********  Create Dashboard Stats Job Completed   ********');
    console.log('*********************************************************');
  } catch (error) {
    console.log('*********************************************************');
    console.log('***********  Create Dashboard Stats Job Retry  **********');
    console.log('*********************************************************');
    console.log(error.message);
    console.log('*********************************************************');

    job.attrs.state = JOB_STATES.FAILED;
    job.attrs.failedAt = new Date();
    job.attrs.failReason = error.message;
    await job.save();
  }

  done();
});

agenda.define('Job_1', async (job) => {
  try {

    console.log('Job 1 is running...');
    job.attrs.someCustomProperty = 'Job_1 Updated Value';
  } catch (error) {

    console.error('Job 1 encountered an error:', error.message);
  }
});
  

agenda.define('Job_02', async (job) => {
  console.log('Job running in seperate process:', job.attrs.name);
});

agenda.define('Job3', async (job, done) => {
  try {
    console.log('Job 3 is running...');
    job.attrs.someCustomProperty = 'Updated value';
    throw new Error('Something went wrong');
  
  } catch (error) {
  
    console.error('Job 3 encountered an error:', error.message);
    done(error);
  }
});

export default agenda;
