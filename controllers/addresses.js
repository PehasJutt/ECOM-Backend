import { Addresses, Users } from '../models';

const SaveAddresses = async (data) => {
  const address = new Addresses(data);
   
  return (await address.save());
};

const GetAddresses = async (id) => {
  return ( await Addresses.find({ userId: id }));
};

const SetDefaultAddress = async ({ userId, addressId }) => {
  return ( await Users.updateOne({ _id: userId }, { defaultAddressId: addressId },{ new: true }));
};

export {
  SaveAddresses,
  GetAddresses,
  SetDefaultAddress
};