import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './schemas/user.schema';
import { LoginDto, CreateUserDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // Ensure username is a string and use $eq to prevent NoSQL injection
    if (typeof username !== 'string') {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    const user = await this.userModel.findOne({ username: { $eq: username }, active: true });
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = { sub: user._id, username: user.username, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    };
  }

  async createUser(createUserDto: CreateUserDto) {
    const { username, password, role } = createUserDto;

    // Ensure username is a string and use $eq to prevent NoSQL injection
    if (typeof username !== 'string') {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    const existingUser = await this.userModel.findOne({ username: { $eq: username } });
    if (existingUser) {
      throw new UnauthorizedException('Usuário já existe');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new this.userModel({
      username,
      password: hashedPassword,
      role: role || 'admin',
    });

    await user.save();

    return {
      id: user._id,
      username: user.username,
      role: user.role,
    };
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userModel.findById(payload.sub);

      if (!user?.active) {
        throw new UnauthorizedException();
      }

      return {
        id: user._id,
        username: user.username,
        role: user.role,
      };
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
