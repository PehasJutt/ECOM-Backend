import mongoose from 'mongoose';

const dashboardStatSchema = new mongoose.Schema(
  {
    todayStats: Object,
    sevenDayStats: Object,
    thirtyDayStats: Object,
    annualStats: Array,
    orderStats: Object,
    topSellingProds: Array
  },
  {
    timestamps: true
  }
);

const DashboardStats = mongoose.model('DashboardStats', dashboardStatSchema);

export default DashboardStats;