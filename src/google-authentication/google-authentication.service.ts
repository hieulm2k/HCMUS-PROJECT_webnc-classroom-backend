import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, Auth } from 'googleapis';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class GoogleAuthenticationService {
  oauthClient: Auth.OAuth2Client;
  constructor(
    private readonly usersService: UserService,
    private readonly configService: ConfigService,
    private readonly authenticationService: AuthService,
  ) {
    const clientID = this.configService.get('GOOGLE_AUTH_CLIENT_ID');
    const clientSecret = this.configService.get('GOOGLE_AUTH_CLIENT_SECRET');

    this.oauthClient = new google.auth.OAuth2(clientID, clientSecret);
  }

  async authenticate(token: string) {
    const tokenInfo = await this.oauthClient.getTokenInfo(token);

    const email = tokenInfo.email;

    try {
      const user = await this.usersService.getByEmail(email);

      return this.handleRegisteredUser(user);
    } catch (error) {
      if (error.status !== 404) {
        throw new error();
      }

      return this.registerUser(token, email);
    }
  }

  async registerUser(token: string, email: string) {
    const userData = await this.getUserData(token);
    const name = userData.name;

    const user = await this.usersService.createWithGoogle(email, name);

    return this.handleRegisteredUser(user);
  }

  async getUserData(token: string) {
    const userInfoClient = google.oauth2('v2').userinfo;

    this.oauthClient.setCredentials({
      access_token: token,
    });

    const userInfoResponse = await userInfoClient.get({
      auth: this.oauthClient,
    });

    return userInfoResponse.data;
  }

  async handleRegisteredUser(user: User) {
    if (!user.isRegisteredWithGoogle) {
      throw new UnauthorizedException(
        'You are already register account with this email!',
      );
    }

    const accessToken = await this.authenticationService.getJwtAccessToken(
      user.email,
    );

    return {
      user: user,
      accessToken,
    };
  }
}
