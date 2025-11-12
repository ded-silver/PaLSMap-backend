import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable
} from '@nestjs/common'

@Injectable()
export class AdminGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest()
		const user = request.user

		if (!user) {
			throw new ForbiddenException('Пользователь не авторизован')
		}

		if (!user.isAdmin) {
			throw new ForbiddenException('Недостаточно прав доступа')
		}

		return true
	}
}
