{
	'targets': [
		{
			'target_name': 'noble',
			'conditions': [
				['OS=="mac"', {
					'dependencies': [
						'native/mac/binding.gyp:binding',
					],
				}],
			],
		},
	],
}
