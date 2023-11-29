import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  reciever:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
  },
  body: String,
  isRead:  {
    type: Boolean,
    default: false,
  }
},
{
  timestamps: true
}
);

const Notifications = mongoose.model('Notifications', notificationSchema);

export default Notifications;