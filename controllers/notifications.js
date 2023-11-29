import { Notifications } from '../models';

const GetNotifications = async (id) => {
  return ( await Notifications.find({
    reciever: id,
    isRead: false
  }));
};

const ReadNotification = async (id) => {
  console.log('id', id);

  return ( await Notifications.updateOne({ _id: id }, { isRead: true },{ new: true }));
};

export {
  GetNotifications,
  ReadNotification
};