import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const abbreviations = [
	{ short: 'НПС', full: 'Нефтеперекачивающая Станция' },
	{ short: 'РП', full: 'Резервуарный парк' },
	{ short: 'КП', full: 'Контрольный пункт' },
	{ short: 'ПНС', full: 'Пункт Насосной Станции' },
	{ short: 'МНС', full: 'Магистральная Насосная Станция' },
	{
		short: 'САР',
		full: 'Система Автоматического регулирования объекта'
	},
	{ short: 'ФГУ', full: 'Фильтр Грязеуловитель' },
	{
		short: 'КППСОД',
		full: 'Контрольный Пункт Пуска и Приема Средств Очистки и Диагностики'
	}
]

async function main() {
	console.log('Начало заполнения справочника аббревиатур...')

	for (const abbr of abbreviations) {
		const existing = await prisma.dictionary.findUnique({
			where: { short: abbr.short }
		})

		if (!existing) {
			await prisma.dictionary.create({
				data: {
					short: abbr.short,
					full: abbr.full
				}
			})
			console.log(`✓ Добавлено: ${abbr.short} - ${abbr.full}`)
		} else {
			console.log(`⊘ Пропущено (уже существует): ${abbr.short}`)
		}
	}

	console.log('Заполнение справочника завершено!')
}

main()
	.catch(e => {
		console.error('Ошибка при заполнении справочника:', e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
