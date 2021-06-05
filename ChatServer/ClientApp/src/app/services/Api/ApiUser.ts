import {ApiService} from '../Api.Service';
import {UserModel} from '../../models/UserModel';
import {Convert, Network} from '../CustomClass';
import {MediaService} from '../MediaService';

export class ApiUser{
  private static ServiceName = 'user';

  static getMyInfo(): UserModel{
    const res = this.http('/my', 'GET');
    const user = new UserModel();
    user.id = res.id;
    user.nickname = res.nickname;
    user.userName = res.userName;
    user.email = res.email;
    user.deleteIfMissingFromMonths = res.deleteIfMissingFromMonths;
    if (res.imgContent !== null){
      user.imgContent = MediaService.ConstructImageUrl(res.imgContent);
    }else {
      Convert.toDataURL('assets/imgs/default-user-avatar-96.png', (resCall) => {
        user.imgContent = resCall;
      });
    }
    return user;
  }

  static setMyEmail(email: string): any{
    return this.http(`/my/email/set?val=${email}`, 'POST');
  }
  static setMyNickname(nickname: string): any{
    return this.http(`/my/nickname/set?val=${nickname}`, 'POST');
  }
  static setMyUserName(username: string): any{
    return this.http(`/my/username/set?val=${username}`, 'POST');
  }
  static setMyImage(image: any): any{
    const api = new ApiService('');
    return Network.UploadFile(`${api.RootUrl}/${this.ServiceName}/my/img/set`, image, 'img');
  }

  static getUser(id: string): UserModel{
    return this.http(`/info/${id}`, 'GET');
  }

  static setPassword(NewPassword: string, OldPassword: string): any{
    return this.http(`/my/password/set?newP=${NewPassword}&oldP=${OldPassword}`, 'POST');
  }

  static http(URL: string, Type: string, Async?: boolean): any {
    const api = new ApiService(this.ServiceName);
    return api.http(URL, Type, Async);
  }
}
