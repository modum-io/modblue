{
	'targets': [
		{
			'target_name': 'modblue-mac',
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
			'conditions': [
				['OS=="win"', {
					'dependencies': [
						'native/win/windows.foundation/binding.gyp:windows.foundation',
						'native/win/windows.storage.streams/binding.gyp:windows.storage.streams',
						'native/win/windows.devices.bluetooth/binding.gyp:windows.devices.bluetooth',
						'native/win/windows.devices.bluetooth.advertisement/binding.gyp:windows.devices.bluetooth.advertisement',
						'native/win/windows.devices.bluetooth.genericattributeprofile/binding.gyp:windows.devices.bluetooth.genericattributeprofile',
						'native/win/windows.devices.enumeration/binding.gyp:windows.devices.enumeration',
						'native/win/windows.devices.radios/binding.gyp:windows.devices.radios',
					],
				}],
			],
		},
	],
}
