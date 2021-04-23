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
						'native/win/binding.gyp:win-ble',
					],
				}],
			],
		},
	],
}
