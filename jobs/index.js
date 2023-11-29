import agenda from './agenda';

export const invokeDashboardJob = async (time)=> {
  await agenda.every(time, 'DashboardJob');

};

export const invokeJob1 = async ()=> {
  await agenda.every('3 minutes', 'Job_1');
};
