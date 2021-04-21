{
	'targets': [
		{
			'target_name': 'modblue-mac',
			'type': 'none',
			'conditions': [
				['OS=="mac"', {
					'dependencies': [
						'native/mac/binding.gyp:mac-ble',
					],
				}],
			],
		},
		{
			'target_name': 'modblue-win',
			'type': 'none',
			'conditions': [
				['OS=="win"', {
					'dependencies': [
						'native/win/foundation/binding.gyp:win-foundation',
						'native/win/storage.streams/binding.gyp:win-storage.streams',
						'native/win/dev.ble/binding.gyp:win-dev.ble',
						'native/win/dev.ble.adv/binding.gyp:win-dev.ble.adv',
						'native/win/dev.ble.gap/binding.gyp:win-dev.ble.gap',
						'native/win/dev.enum/binding.gyp:win-dev.enum',
						'native/win/dev.radios/binding.gyp:win-dev.radios',
					],
				}],
			],
		},
	],
}
