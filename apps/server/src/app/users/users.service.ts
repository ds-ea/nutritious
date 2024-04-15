import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { User } from '@nutritious/core';
import { hash } from 'argon2';
import { CrudMethodOpts } from 'nestjs-prisma-crud';
import { JsxTranslatedCrudService } from '../core/services/jsx-translated-crud.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';


@Injectable()
export class UsersService extends JsxTranslatedCrudService<User>{
	constructor(
		private readonly config:ConfigService,
	){
		super( {
			model: 'user',
			allowedJoins: [],
			defaultJoins: [],
			forbiddenPaths: [ 'password' ],
		} );
	}

	public override async create( createDto:CreateUserDto, opts:CrudMethodOpts ):Promise<User>{
		await this._updatePassWhenProvided( createDto );
		const created = super.create( createDto, opts );
		return created;
	}

	public override async update( id:string | number, updateDto:UpdateUserDto, opts:CrudMethodOpts ):Promise<User>{
		if( 'id' in updateDto )
			delete updateDto['id'];

		await this._updatePassWhenProvided( updateDto );

		const upd = await super.update( id, updateDto, opts );
		return upd;
	}

	private async _updatePassWhenProvided<T extends CreateUserDto | UpdateUserDto>( data:T ){

		if( 'password' in data )
			throw new Error( 'can not set password directly' );

		if( data.newPassword ){
			if( data.newPassword?.length < 2 )
				throw new Error( 'invalid password' );

			const secret = Buffer.from( this.config.getOrThrow<string>( 'PW_SECRET' ), 'utf-8' );
			const hashedPass = await hash( data.newPassword, { secret } );

			data.password = hashedPass;
			delete data.newPassword;
		}

	}
}
