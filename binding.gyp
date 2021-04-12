{
	'targets': [
		{
			'target_name': 'modblue',
			'conditions': [
				['OS=="mac"', {
					'dependencies': [
						'native/mac/binding.gyp:native',
					],
				}],
			],
		},
	],
}
