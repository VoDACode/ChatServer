export enum StorageType {
  Channel, Group, Private
}
export class StorageModel{
  id: string;
  imgContent = '';
  name = '';
  status = '';
  isPrivate: boolean;
  uniqueName = '';
  createDate: string;
  type: StorageType;
}
