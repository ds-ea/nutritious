import AdminJSFastify from '@adminjs/fastify';
import { Database, Resource } from '@adminjs/prisma';
import { PrismaClient } from '@prisma/client';

import AdminJS from 'adminjs';
import Fastify from 'fastify';
import { componentLoader } from './resources/components.js';
import { enumMap, resources } from './resources/setup.js';


// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
BigInt.prototype.toJSON = function () { return this.toString(); };


const PORT = 7880

const start = async () => {

	const prisma = new PrismaClient();
	AdminJS.registerAdapter({ Database, Resource })

	const app = Fastify({})
	const admin = new AdminJS({
		rootPath: '/admin',
		componentLoader,
		resources:
			Object.values( resources ).map(
				( [ model, options, features ] ) =>
					( { model, options, features, client:prisma, enumMap } ),
			),
	})

	await AdminJSFastify.buildRouter(
		admin,
		app,
	)

	app.listen({ port: PORT }, (err, addr) => {
		if (err) {
			console.error(err)
		} else {
			console.log(`AdminJS started on http://localhost:${PORT}${admin.options.rootPath}`)
		}
	})
}

start()
