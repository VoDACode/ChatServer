import {StorageModel, StorageType} from './StorageModel';
import {ChatHub} from '../services/app.service.signalR';

export class ContactModel implements StorageModel{
  createDate: string;
  id: string;
  isPrivate: boolean;
  status: string;
  imgContent: string;
  name: string;
  type: StorageType;
  uniqueName: string;
}
