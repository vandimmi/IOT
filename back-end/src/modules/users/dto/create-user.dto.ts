import { IsEmail, IsNotEmpty, IsOptional } from "class-validator";

export class CreateUserDto {
    @IsNotEmpty({ message: 'Name is required' })
    name: string;

    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Email is not valid' })
    email: string;

    @IsNotEmpty({ message: 'Username is required' })
    username: string;

    @IsNotEmpty({ message: 'Password is required' })
    password: string;
    @IsNotEmpty({ message: 'Chat ID is required' })
    chat_id: string;

    @IsOptional()
    age: number;
}
