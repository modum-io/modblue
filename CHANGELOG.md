# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [11.0.0](https://github.com/modum-io/modblue/compare/v10.0.3...v11.0.0) (2021-04-21)

### ⚠ BREAKING CHANGES

- Move optional dependencies to peer dependencies

### Bug Fixes

- Fix prebuilds ([22676fa](https://github.com/modum-io/modblue/commit/22676fa2e0abcc6c123ebf31f0d8c6dc4e249ad0))
- Make dependencies peers again ([1e3e813](https://github.com/modum-io/modblue/commit/1e3e81327b5b84a9f1979ea34dd240d908661d2e))

### [10.0.3](https://github.com/modum-io/modblue/compare/v10.0.2...v10.0.3) (2021-04-21)

### Bug Fixes

- Ubuntu doesn't need prebuilds ([afcf599](https://github.com/modum-io/modblue/commit/afcf59940d7f6100cab908244332e4b7bd7c0bf4))

### [10.0.2](https://github.com/modum-io/modblue/compare/v10.0.1...v10.0.2) (2021-04-21)

### [10.0.1](https://github.com/modum-io/modblue/compare/v10.0.0...v10.0.1) (2021-04-21)

### Bug Fixes

- Fix build calling prebuild ([7bb8577](https://github.com/modum-io/modblue/commit/7bb85778506f2ccf99758ce2b67e8d8320588f0a))
- **hci:** Fix wrong hci package ([df9d73b](https://github.com/modum-io/modblue/commit/df9d73b51b2f604bfabc09c3df9f0a5f3a78ff40))

## [10.0.0](https://github.com/modum-io/modblue/compare/v9.0.0...v10.0.0) (2021-04-21)

### ⚠ BREAKING CHANGES

- **peripheral:** Changes advertisement data format

### Features

- Add prebuild support ([811907b](https://github.com/modum-io/modblue/commit/811907b1c7c781478bb7bb34566934d0df215bf9))
- Improve adapter names ([0c96325](https://github.com/modum-io/modblue/commit/0c9632564575af6cc67865c73712b10dce3dd01d))
- **win:** Add first windows version [WIP] ([ccaa703](https://github.com/modum-io/modblue/commit/ccaa70374715d6f8f64ed88ac8b278917d54f065))
- Add mac bindings [WIP] ([ae9ac95](https://github.com/modum-io/modblue/commit/ae9ac9518baddd9aed3c29c689d0fc015e7adbb8))
- Improve mac bindings ([f18e577](https://github.com/modum-io/modblue/commit/f18e5771de8a5f3d5433d6dbbab2776cb23b270d))

### Bug Fixes

- **dbus:** Fix advertisement data ([23c9ace](https://github.com/modum-io/modblue/commit/23c9acee55a9cdafc8558e42ada3744030fcf159))
- **dbus:** Implement notifications ([3f32190](https://github.com/modum-io/modblue/commit/3f321907bd3705d3a43cdba5c93b1e1d622b14d7))
- **hci:** Fix adapter id issues ([9941aa3](https://github.com/modum-io/modblue/commit/9941aa3fe5cec10fc0f5d0b22b408f437c420562))
- **hci:** Fix hci usb issues ([6b986c0](https://github.com/modum-io/modblue/commit/6b986c0eb06e31f2e161988d85f494927004a47b))
- **hci:** Fix missing device id ([7589641](https://github.com/modum-io/modblue/commit/7589641e6d67f24bcc081b1365184e41748408ef))
- **mac:** Fix binding typo ([668803b](https://github.com/modum-io/modblue/commit/668803b78cc549f54075a7ae14d2e10006d3e5e1))
- **mac:** Fix loading bindings ([1e53c79](https://github.com/modum-io/modblue/commit/1e53c794fa4417069c66eed14fa267f9f33972b6))
- **mac:** Remove build files ([a4d6026](https://github.com/modum-io/modblue/commit/a4d6026b46aa7dfdbf2d0d392a0e2f7bb95b252d))
- **mac:** Use dynamic loading ([79e2526](https://github.com/modum-io/modblue/commit/79e2526f424d114ef2e2e139d28ee8bcc676a4dd))
- **peripheral:** Unify manufacturer data ([189b9af](https://github.com/modum-io/modblue/commit/189b9af44877e09909f3af37dc2d86964b7918ba))
- **win:** Fix ([c2cb7bb](https://github.com/modum-io/modblue/commit/c2cb7bb809d639cd64bd81abcfc2a537ef437db4))
- **win:** Fix import paths ([2f74aa0](https://github.com/modum-io/modblue/commit/2f74aa0ed6daa1ad0c1c7b5890b34ac1d3ba7893))
- **win:** Fix missing global object ([801a01b](https://github.com/modum-io/modblue/commit/801a01b69f9c2a0a410c27277d4966fb9da77f01))
- **win:** Improve adapter handling ([9a77a6a](https://github.com/modum-io/modblue/commit/9a77a6ae082780261a7a36cff2a43c5922600372))
- **win:** Propagate errors ([6885c0f](https://github.com/modum-io/modblue/commit/6885c0f63f14d2b571bbd157a0776590bc7d59eb))
- **win:** Remove package files for nan import ([e782dbc](https://github.com/modum-io/modblue/commit/e782dbcb22e58512c7d6a4ac98192b3ac1a5d08e))
- **win:** Shorten file paths ([04727d4](https://github.com/modum-io/modblue/commit/04727d4114e90b505be0be70ed98983720f005d0))
- **win:** Try fixing missing imports ([24eeb95](https://github.com/modum-io/modblue/commit/24eeb956940514c5cf192efd11e321a0718fbef5))
- rework import paths ([4a3ce4c](https://github.com/modum-io/modblue/commit/4a3ce4c99898d870ea4fdef1ad79c0b910bc37ff))
- **win:** Try to fix win loading issues ([03f06b7](https://github.com/modum-io/modblue/commit/03f06b72eeeed59ad447e749eb80ec4be86a4a58))
- Convert js to ts ([da757a3](https://github.com/modum-io/modblue/commit/da757a39cfa86503092e583fc53bbc5f541bbf02))
- **win:** Try fixing nan ([c9a5de0](https://github.com/modum-io/modblue/commit/c9a5de08733e1bf128fa4d19f2e4cef0160bf7bc))
- **win:** Try relative nan path ([e374894](https://github.com/modum-io/modblue/commit/e374894e97fec840918644be6eed29bb793d99fe))
- Fix mac bindings ([2819426](https://github.com/modum-io/modblue/commit/2819426d675dcbdfe9a6644f338feb6ce4abc677))
- Make peers optional ([15abacc](https://github.com/modum-io/modblue/commit/15abacca6fc589e0882d5b56036b7a49f3d1859e))

## [9.0.0](https://github.com/modum-io/modblue/compare/v8.0.1...v9.0.0) (2021-04-08)

### ⚠ BREAKING CHANGES

- Remove autodetect function

### Bug Fixes

- Remove autodetect ([3ed4b73](https://github.com/modum-io/modblue/commit/3ed4b7318486fc72d3a67fcb84fbf2a26f9bbbfd))

### [8.0.1](https://github.com/modum-io/modblue/compare/v8.0.0...v8.0.1) (2021-04-07)

### Bug Fixes

- **gatt:** Fix gatt advertising issues ([d144465](https://github.com/modum-io/modblue/commit/d144465e1902efbc02ef1b18420b2a29c8c2dde1))
- **gatt:** Fix gatt issues ([84ff6a1](https://github.com/modum-io/modblue/commit/84ff6a1fc3bd8bf3b55ed57b4fe8db8449f7f9ce))
- **gatt:** Fix getting gatt from peripheral ([2d984d4](https://github.com/modum-io/modblue/commit/2d984d4c148da3da5c277235e866ff304d56f612))
- **hci:** Fix gatt issues ([6fdf257](https://github.com/modum-io/modblue/commit/6fdf2577dc0a004cf066cff8da33befa10a33e41))
- **test:** Fix advertise test ([b162ec8](https://github.com/modum-io/modblue/commit/b162ec868be7d29a0728ccd089878f6416f5ad89))

## [8.0.0](https://github.com/modum-io/modblue/compare/v7.0.3...v8.0.0) (2021-04-07)

### ⚠ BREAKING CHANGES

- **web:** Include GATT setup when connecting

### Features

- Allow string filter in scanFor function ([17ca406](https://github.com/modum-io/modblue/commit/17ca406d0139dd85290bba30e250ef8117df96d3))
- **web:** More web functions ([64d95da](https://github.com/modum-io/modblue/commit/64d95dad3d3c7558a18c2056bf0135b33f895e3b))
- **web:** Start implementing scan ([808960a](https://github.com/modum-io/modblue/commit/808960ad51a2d803c5ba07556c72bd471c34f5cf))
- Merge remote and local GATT ([f4bcff8](https://github.com/modum-io/modblue/commit/f4bcff84ae209cc67436be3273638a2f54164449))
- **web:** Add web-bluetooth support [WIP] ([ebc8fc9](https://github.com/modum-io/modblue/commit/ebc8fc99aff9411ea7bd91d3eb8b20c37cebcb6a))

### Bug Fixes

- Possible error when handling errors ([9b8c0e1](https://github.com/modum-io/modblue/commit/9b8c0e1de70a1b75b32e55a6aa8e8d78dbfc1279))
- **dbus:** Fix peripheral state ([bd05dc5](https://github.com/modum-io/modblue/commit/bd05dc53d105479c4994185c75928f2a008577f7))
- **hci:** Correctly detect unauthorized state ([7cac72b](https://github.com/modum-io/modblue/commit/7cac72b59af2967e55bb05af866a3c7e5c85ad03))
- **hci:** Fix possible unhandled promise rejection ([72ec2c7](https://github.com/modum-io/modblue/commit/72ec2c7b35bd9fef8afcd7cb7d10986a7a83cb46))
- **hci:** Hide require in function ([02c931c](https://github.com/modum-io/modblue/commit/02c931ca0f21c845e37a592700797ce37f305a5f))
- **hci:** Hide require in function ([d4df616](https://github.com/modum-io/modblue/commit/d4df61644f440b368c79cc112d1b1f39302e726c))
- **hci:** Improve error handling ([32555ce](https://github.com/modum-io/modblue/commit/32555cecc7e160d6440015754551216b2d44996b))
- **hci:** Possibly fix unhandled exception ([4d93fed](https://github.com/modum-io/modblue/commit/4d93fedfb5f39c7821edb55a45c917e1a5bd0f98))
- Correctly implement scanFor string filter ([c31b425](https://github.com/modum-io/modblue/commit/c31b4254b674a253f73f4b43f237463ecac43689))
- **dbus:** Don't load class until needed ([7de2950](https://github.com/modum-io/modblue/commit/7de29505f07303877fa2a9a54014e319542f6ff2))
- **dbus:** More fixes for web ([b9c219f](https://github.com/modum-io/modblue/commit/b9c219fb6c0e1c1dafcd2399918ab2dcc28576a2))
- **web:** Fix disconnect errors ([c36744c](https://github.com/modum-io/modblue/commit/c36744ca10784523578424ed30d23c52d37ff379))
- **web:** Fix settings filters ([b184206](https://github.com/modum-io/modblue/commit/b1842060d8137087c0b651006fdf3a6e2539a49e))
- **web:** Implement scanFor ([f4b3866](https://github.com/modum-io/modblue/commit/f4b386662ce5cae279288ba338eeaf1a2380a09b))
- **web:** Make scan run at least once ([3f63a38](https://github.com/modum-io/modblue/commit/3f63a385fdd3d3ca77984ef916c98fd29848fadc))
- **web:** Provide services as optional ([b81ac9b](https://github.com/modum-io/modblue/commit/b81ac9b3a403f57d23b36d69ad8e7084d258630c))
- **web:** Remove old call ([18bf772](https://github.com/modum-io/modblue/commit/18bf772327e90624e0d56e9b3025a6f639c97cc5))
- Change tsconfig ([e0e3860](https://github.com/modum-io/modblue/commit/e0e3860645992a075accb87815f487cfe43fc699))
- Clean up code & docs ([c52c2c0](https://github.com/modum-io/modblue/commit/c52c2c0dd77f79f6850d36f0e457cb32bfaf918f))
- ES2020 except imports ([2bde317](https://github.com/modum-io/modblue/commit/2bde31718335719dcc6393e64e05d13c31014386))
- HCI status json ([d4313ad](https://github.com/modum-io/modblue/commit/d4313adc65b3f6912762c71e83ad9098fe82964b))
- Possible fix web errors ([31b849f](https://github.com/modum-io/modblue/commit/31b849f53703075906571dbc79c0099a48ae558a))
- Remove unknown inspect type ([20b75b3](https://github.com/modum-io/modblue/commit/20b75b3eb6fd8d6fc1bd7dffa24664b2411be733))
- Try es2020 ([d801f2a](https://github.com/modum-io/modblue/commit/d801f2a640327bfe4535032048c3034e5c93474c))
- Updated type files ([ee45724](https://github.com/modum-io/modblue/commit/ee45724bc6727343789b09bcca818fceb9f96bf5))
- Use new import ([787f84c](https://github.com/modum-io/modblue/commit/787f84ce37eb82581f26aa558cd336483af100da))
- Webpack errors & warnings ([d23f56c](https://github.com/modum-io/modblue/commit/d23f56c3892bdb25a2dff76a5767747c0c08cdad))

### [7.0.3](https://github.com/modum-io/modblue/compare/v7.0.2...v7.0.3) (2021-03-12)

### Bug Fixes

- **hci:** Make initialize logic more robust ([1a1e6d2](https://github.com/modum-io/modblue/commit/1a1e6d2726debeabff017d5cf7be6eea45803744))

### [7.0.2](https://github.com/modum-io/modblue/compare/v7.0.1...v7.0.2) (2021-03-12)

### Bug Fixes

- **hci:** Fix possible scanning issue ([5dfd862](https://github.com/modum-io/modblue/commit/5dfd86272fb157e76c64d405aa6193c538d62d30))

### [7.0.1](https://github.com/modum-io/modblue/compare/v7.0.0...v7.0.1) (2021-03-12)

### Bug Fixes

- **adapter:** Fix issue with no address ([fdf856c](https://github.com/modum-io/modblue/commit/fdf856c639171e96545ed9514b7f6e295c9fac8c))

## [7.0.0](https://github.com/modum-io/modblue/compare/v6.0.1...v7.0.0) (2021-03-12)

### ⚠ BREAKING CHANGES

- hci addresses changed from uppercase to lowercase

### Bug Fixes

- **gatt:** Update property docs ([05e9df8](https://github.com/modum-io/modblue/commit/05e9df8cbe0a5882f466ed1ca20d54ba5ca8477e))
- Make hex address casing consistent ([8ede3f1](https://github.com/modum-io/modblue/commit/8ede3f1b716fa462d98f1c4f05e232bec51971fb))

### [6.0.1](https://github.com/modum-io/modblue/compare/v6.0.0...v6.0.1) (2021-03-09)

### Bug Fixes

- Clean up typescript code ([5f3e06f](https://github.com/modum-io/modblue/commit/5f3e06f733be7c869f778fbeb4fb61f4b9e11824))
- Make library work with require ([1bb8f98](https://github.com/modum-io/modblue/commit/1bb8f984eff51fb082e4c87fae59551c74a84ec0))

## [6.0.0](https://github.com/modum-io/modblue/compare/v5.2.2...v6.0.0) (2021-03-05)

### ⚠ BREAKING CHANGES

- hci or dbus dependency must be included manually

### Bug Fixes

- Change typescript target ([09e7502](https://github.com/modum-io/modblue/commit/09e7502a833451e49371ff61067d8f5beee02739))
- Project structure ([4c3c12b](https://github.com/modum-io/modblue/commit/4c3c12bdd5cfeb8b252ddfbfe4a33d23140f7ea0))
- Remove subprojects ([af20da9](https://github.com/modum-io/modblue/commit/af20da991f6ede3117bed0f770f16ad029e39318))
- **hci:** Fix acl packet counting issues ([7422855](https://github.com/modum-io/modblue/commit/74228551c1a3b43482809b2a41ba8d1227d12ace))
- **hci:** Fix descriptors & notify events ([52d64ec](https://github.com/modum-io/modblue/commit/52d64ec39ed079a2082360f74bdea11d099e206f))
- **hci:** Fix notifications ([55e7860](https://github.com/modum-io/modblue/commit/55e7860319d5f746f5fddddd1ee032a7ee9c395d))
- **hci:** Limit acl queue processing ([973d148](https://github.com/modum-io/modblue/commit/973d148508c5f7cdf4cf28dbed5a6ded67d5c30c))
- Make hci and dbus peer dependencies ([0fc88be](https://github.com/modum-io/modblue/commit/0fc88becf4e7a96210d2419435f7456e05abc091))
- Update readme to reflect module changes ([24b7331](https://github.com/modum-io/modblue/commit/24b73311f39f2609cf7251692c992da4a7667726))

### [5.2.2](https://github.com/modum-io/modblue/compare/v5.2.1...v5.2.2) (2021-02-22)

### Bug Fixes

- **hci:** Fix adapter issues ([04ed396](https://github.com/modum-io/modblue/commit/04ed3968e27171686ef5899c78765952e11345b3))

### [5.2.1](https://github.com/modum-io/modblue/compare/v5.2.0...v5.2.1) (2021-02-15)

### Bug Fixes

- **hci:** Fix console log ([b81c1af](https://github.com/modum-io/modblue/commit/b81c1afe8984695c6adaec6a0542a1bff1b04200))

## [5.2.0](https://github.com/modum-io/modblue/compare/v5.1.4...v5.2.0) (2021-02-15)

### Features

- Add connection options ([6291de0](https://github.com/modum-io/modblue/commit/6291de0793f17a4733a9ded74798a730a25fd03e))
- **hci:** Add better disconnect handling ([6291de0](https://github.com/modum-io/modblue/commit/6291de0793f17a4733a9ded74798a730a25fd03e))
- **hci:** Track connection interval ([6291de0](https://github.com/modum-io/modblue/commit/6291de0793f17a4733a9ded74798a730a25fd03e))

### Bug Fixes

- **hci:** Add more info to gatt error ([c32c755](https://github.com/modum-io/modblue/commit/c32c7554d58bdd86423c1f08e8b20468cd183992))
- **hci:** Increase GATT timeout ([6291de0](https://github.com/modum-io/modblue/commit/6291de0793f17a4733a9ded74798a730a25fd03e))

### [5.1.4](https://github.com/modum-io/modblue/compare/v5.1.3...v5.1.4) (2021-02-11)

### Bug Fixes

- Fix husky running after install ([890a13f](https://github.com/modum-io/modblue/commit/890a13fb96ec54dd1f289b41885b03b3ba4cdf47))

### [5.1.3](https://github.com/modum-io/modblue/compare/v5.1.2...v5.1.3) (2021-02-11)

### Bug Fixes

- **hci:** Add better cleanup handling ([a019f61](https://github.com/modum-io/modblue/commit/a019f610221ed577238c4d40c8d5f1304607154c))

### [5.1.2](https://github.com/modum-io/modblue/compare/v5.1.1...v5.1.2) (2021-02-08)

### Bug Fixes

- Use new mutex cancel interface on dispose ([7bc581d](https://github.com/modum-io/modblue/commit/7bc581df1e8bbfcb369fd7f38510571f7acce26f))
- **hci:** Fix re-enabling scanning and advertising ([0ec0647](https://github.com/modum-io/modblue/commit/0ec064748f8d38167b8e98f449041eaa333edbe7))

### [5.1.1](https://github.com/modum-io/modblue/compare/v5.1.0...v5.1.1) (2021-02-05)

### Bug Fixes

- **hci:** BLE 4.2 Fixes ([d70ab0b](https://github.com/modum-io/modblue/commit/d70ab0bdb585ffc636e5d23e5a3b5367af2eacb6))
- **hci:** Concurrent slave & master connections ([766b5c8](https://github.com/modum-io/modblue/commit/766b5c82d8f10eebc3c78512deb227ba8d3dce93))
- **hci:** Fix connect & advertise issues ([dc7205c](https://github.com/modum-io/modblue/commit/dc7205cdbf139297c15320fef8dd08d2d2788c6e))
- **hci:** Fix disconnect issues ([7f56cd3](https://github.com/modum-io/modblue/commit/7f56cd31561aa0ff38e790bb686ac8ca4012be76))
- **hci:** Fix incorrect advertising states ([e01b9a6](https://github.com/modum-io/modblue/commit/e01b9a659823372d978b1da67285d774b871d334))
- **hci:** Reenable advertising after disconnect ([418eb2e](https://github.com/modum-io/modblue/commit/418eb2ea9f2a9b09275c1dec7eb8ded090ebdbbd))

## [5.1.0](https://github.com/modum-io/modblue/compare/v5.0.2...v5.1.0) (2021-02-05)

### Features

- **hci:** Improve error handling ([dd6c2b9](https://github.com/modum-io/modblue/commit/dd6c2b91c1efc96233ac0e7cbd0058770d4637af))

### [5.0.2](https://github.com/modum-io/modblue/compare/v5.0.1...v5.0.2) (2021-01-28)

### Bug Fixes

- **hci:** Add better errors and error stacks ([d9ae0b9](https://github.com/modum-io/modblue/commit/d9ae0b94f9ed7ecb4a4f219e542f49635adb8a0a))
- **hci:** Add info about lock holder on timeout ([c80e3f6](https://github.com/modum-io/modblue/commit/c80e3f6e626913d42b4dcbf34c646370b0df82d6))
- **hci:** Fix possible deadlock when disconnecting ([db6c57e](https://github.com/modum-io/modblue/commit/db6c57e331af3be596d48e520cdc5d9f1178c1ab))

### [5.0.1](https://github.com/modum-io/modblue/compare/v5.0.0...v5.0.1) (2021-01-22)

### Bug Fixes

- **gatt:** Improve error messages ([d74649e](https://github.com/modum-io/modblue/commit/d74649edcb25f16a2e5bd1b1063567f735de1dd6))
- **hci:** Fix possible deadlock when connecting ([4b3fc99](https://github.com/modum-io/modblue/commit/4b3fc996b4cf4f3b6657b3012b566a5e232e6447))

## [5.0.0](https://github.com/modum-io/modblue/compare/v4.1.4...v5.0.0) (2021-01-13)

### ⚠ BREAKING CHANGES

- Rename "Noble" class to "MODblue"

### Features

- Rename "Noble" to "MODblue" ([d63387c](https://github.com/modum-io/modblue/commit/d63387cc575207c1e6ca1cb095d84889e7a10eda))

### Bug Fixes

- Replace doc refs of "Noble" with "MODblue" ([daf594b](https://github.com/modum-io/modblue/commit/daf594b4afa927287fed5df192fbc77717274762))
- **hci** Fix deadlock issue in GATT ([d63387c](https://github.com/modum-io/modblue/commit/d63387cc575207c1e6ca1cb095d84889e7a10eda))
- **hci** Show proper disconnect reason ([d63387c](https://github.com/modum-io/modblue/commit/d63387cc575207c1e6ca1cb095d84889e7a10eda))

### [4.1.4](https://github.com/modum-io/modblue/compare/v4.1.3...v4.1.4) (2020-12-07)

### Bug Fixes

- **hci:** Improve concurrent stability ([44eb87b](https://github.com/modum-io/modblue/commit/44eb87bb67fc3c96baf4712cad9db079c3fc734e))
- **hci:** Remove console log ([1768fc0](https://github.com/modum-io/modblue/commit/1768fc028a37136bf306879364158858c082cc9e))

### [4.1.3](https://github.com/modum-io/modblue/compare/v4.1.2...v4.1.3) (2020-11-25)

### Bug Fixes

- **hci:** Stability fixes for connect & disconnect ([2eada17](https://github.com/modum-io/modblue/commit/2eada1718e956a8a465c01b1d0dd7087dd2263f0))

### [4.1.2](https://github.com/modum-io/modblue/compare/v4.1.1...v4.1.2) (2020-11-24)

### Bug Fixes

- **hci:** Add mutex timeouts ([9f59c08](https://github.com/modum-io/modblue/commit/9f59c08cf295537d0efa27bc8c092f65c1951f02))
- **hci:** Fix concurrent connection issues ([355b912](https://github.com/modum-io/modblue/commit/355b912a85ef9356bc44fa8e8a98d6075f9eedca))
- **hci:** Fix peripheral connects ([c6eea1c](https://github.com/modum-io/modblue/commit/c6eea1cbef8a722d4067df26a2fb226970969f4e))
- **hci:** Preserve stack traces in callbacks ([c4eb2f3](https://github.com/modum-io/modblue/commit/c4eb2f3cff21af5b4cb8f5f442cf7637dc5e5bba))

### [4.1.1](https://github.com/modum-io/modblue/compare/v4.1.0...v4.1.1) (2020-11-20)

### Bug Fixes

- **gatt:** Fix gatt commands after dispose ([4cbc5c8](https://github.com/modum-io/modblue/commit/4cbc5c892cd5ecebc80eb2ef517468236df9a93b))
- **hci:** Don't throw errors on unknown commands ([db1a49f](https://github.com/modum-io/modblue/commit/db1a49f82955e65230cfdad12b8de0aa5bc4c7c7))

## [4.1.0](https://github.com/modum-io/modblue/compare/v4.0.0...v4.1.0) (2020-11-19)

### Features

- **adapter:** Add isAdvertising getter ([3a11903](https://github.com/modum-io/modblue/commit/3a11903086763489d0da28bc703854c384ff8535))
- **hci:** Use command mutex ([a8b2899](https://github.com/modum-io/modblue/commit/a8b28990d9a26a22c33f01b7c7755823b0e80996))
- **hci:** Use gatt command mutex ([f6c9644](https://github.com/modum-io/modblue/commit/f6c964466a65b9434c84a3d038ef1793cf27aa83))

### Bug Fixes

- **hci:** Fix not resetting mtu on disconnect ([f3226f6](https://github.com/modum-io/modblue/commit/f3226f6f00a979fbb3beb221a46688667b737259))

## [4.0.0](https://github.com/modum-io/modblue/compare/v3.0.0...v4.0.0) (2020-11-11)

### ⚠ BREAKING CHANGES

- Remove some obsolete functions
- Remove characteristic inheritance of EventEmitter

### Features

- **adapter:** Add `scanFor` function ([c176742](https://github.com/modum-io/modblue/commit/c176742a6135dfa8df5d195c8af7fe115216608a))
- **docs:** Add docs for most classes ([0e0d01d](https://github.com/modum-io/modblue/commit/0e0d01de338a8ac3abe4f7b3504262da939b0dd0))

## [3.0.0](https://github.com/modum-io/modblue/compare/v2.0.3...v3.0.0) (2020-11-10)

### ⚠ BREAKING CHANGES

- **package:** Change scope ([35bd780](https://github.com/modum-io/modblue/commit/35bd780ca025b0dd247211a426a9dd02e9ec336c))

### [2.0.3](https://github.com/modum-io/modblue/compare/v2.0.2...v2.0.3) (2020-11-10)

### [2.0.2](https://github.com/modum-io/modblue/compare/v2.0.1...v2.0.2) (2020-11-05)

### Bug Fixes

- Remove console log ([fdd121a](https://github.com/modum-io/modblue/commit/fdd121a3311b79036925b41e319d59f6853d9826))

### [2.0.1](https://github.com/modum-io/modblue/compare/v2.0.0...v2.0.1) (2020-11-05)

### Bug Fixes

- **mtu:** Fix mtu negotiation ([ee936c0](https://github.com/modum-io/modblue/commit/ee936c058750fa3e060f4ed583e20279bbf772f8))

## [2.0.0](https://github.com/modum-io/modblue/compare/v1.0.1...v2.0.0) (2020-11-05)

### ⚠ BREAKING CHANGES

- **hci:** Align peripheral constructor parameter order with data

### Bug Fixes

- **hci:** Fix issues when scanning and advertising ([f0c41ee](https://github.com/modum-io/modblue/commit/f0c41eefb24faa13125a07aa1d2c3be329476937))

### [1.0.1](https://github.com/modum-io/modblue/compare/v1.0.0...v1.0.1) (2020-11-04)

### Bug Fixes

- **peripheral:** Fix not using negotiated MTU ([a1217c0](https://github.com/modum-io/modblue/commit/a1217c00f248e17fac789ecb245aaa747a02b1b9))

## [1.0.0](https://github.com/modum-io/modblue/compare/v0.1.0...v1.0.0) (2020-11-04)

### ⚠ BREAKING CHANGES

- Change base class names
- Rework library structure
- Changed class names
- Added gat object

### Features

- Rename binding classes ([0f3ba2d](https://github.com/modum-io/modblue/commit/0f3ba2d83127b353fba4c3f585910dd8d03eccfd))
- **hci:** Start reworking hci ([4e627e9](https://github.com/modum-io/modblue/commit/4e627e9e3b24a2d9a5fd1357cfdfbc57b59aa2a0))
- Add bleno functionality ([1ce7278](https://github.com/modum-io/modblue/commit/1ce7278ab2b44c11fe69b766af6141fa0073e53d))
- Implement advertising ([eab0c61](https://github.com/modum-io/modblue/commit/eab0c61abe8c37c9af9a2fbf216e2e14d1f12b2d))
- Major rework ([560b2c5](https://github.com/modum-io/modblue/commit/560b2c5dc1cdb83a21b84c2977bdb533e563b761))
- Major structural rework ([25de9f3](https://github.com/modum-io/modblue/commit/25de9f3ce94fa269fdb713b04761767aef4e630a))

### Bug Fixes

- Remove console logs ([f61495c](https://github.com/modum-io/modblue/commit/f61495cd51304a33b5ab80163fe8a0579aa448ef))
- **peripheral:** Fix discovering services ([098bb3f](https://github.com/modum-io/modblue/commit/098bb3fa0d180f72d7c48401faa5e008880609ee))
- Fix gatt issues [WIP] ([14f23c5](https://github.com/modum-io/modblue/commit/14f23c5c2f268b767d0773394540f1df9cc1ef0e))
- Fix some connection issues [WIP] ([378c305](https://github.com/modum-io/modblue/commit/378c3056938029dede02c53218a45803a1d17fb2))
- Stop advertising before configuring ([41b8172](https://github.com/modum-io/modblue/commit/41b8172e0230bfd56ca382d57c4312cc6bfa329f))
- **gatt:** Fix order of handles ([b5e2665](https://github.com/modum-io/modblue/commit/b5e26658168c431de935da1c95c17ae872486fb1))
- **hci:** Don't use deprecated Buffer constructor ([812dbb8](https://github.com/modum-io/modblue/commit/812dbb8647fedfe668a92af54c5a199912b479b7))
- **hci:** Fix invalid states not ending init ([be847bf](https://github.com/modum-io/modblue/commit/be847bf71cd8a9f16468f3ff07b3626255a74d50))
- **hci:** Start handling incoming connection [WIP] ([9c3e7b8](https://github.com/modum-io/modblue/commit/9c3e7b896a516fceb141a2a3ce2911a51498a541))

## [0.1.0](https://github.com/modum-io/noble2/compare/v0.0.3...v0.1.0) (2020-11-03)

### ⚠ BREAKING CHANGES

- Rename package
- **hci:** Change disconnect return value

### Features

- Update dependencies ([3adf744](https://github.com/modum-io/noble2/commit/3adf744bb097f103df3899c6fab6c5a5f3a8eec6))
- **hci:** Rework hci interface ([bade296](https://github.com/modum-io/noble2/commit/bade296fe5faeec291db95ae7d2a9cfcee06ba41))

### [0.0.3](https://github.com/modum-io/noble2/compare/v0.0.2...v0.0.3) (2020-09-29)

### 0.0.2 (2020-09-29)

### Features

- Add access to discovered things ([7882e49](https://github.com/modum-io/noble2/commit/7882e49c8b9aa97476c340c13355a4e91b0c63d4))
- Add better typings ([2907e60](https://github.com/modum-io/noble2/commit/2907e607c0e45c068fdf2a8952deb8f00e10e1ba))
- Add dbus support [WIP] ([5a83e93](https://github.com/modum-io/noble2/commit/5a83e93472374fe8552d6e178409cd41deddfc38))
- Add deviceId selection to init ([c969615](https://github.com/modum-io/noble2/commit/c969615c7bc3252ebb9dae240bc2642072b80ba4))
- Add dipose methods ([0f27d82](https://github.com/modum-io/noble2/commit/0f27d825d3d8332736aad9bbcd7b77729541e98b))
- Expose adapter list on noble ([9c48bf8](https://github.com/modum-io/noble2/commit/9c48bf81ff81dfc33fa40de7a7e42c00be36f28f))
- First rework test ([cb69841](https://github.com/modum-io/noble2/commit/cb698418e87642c628efdbcc1cd5087fe771ce40))
- Fix dbus issues ([2371f8e](https://github.com/modum-io/noble2/commit/2371f8e05b44d3581cc7a1b406af6df75caa727d))
- Improve connection handling ([1be8de7](https://github.com/modum-io/noble2/commit/1be8de7ad6216399a4d7c565b0d17c46b20b0bd6))
- Improve gatt class ([c997d6d](https://github.com/modum-io/noble2/commit/c997d6d5f5d46ab72dba825666c4c33e838b4d42))
- Rework bindings ([c606c01](https://github.com/modum-io/noble2/commit/c606c01729099b63bae83bae1c0544f71197b627))

### Bug Fixes

- Add connection timeout ([513f74b](https://github.com/modum-io/noble2/commit/513f74b3c724505004f7ae72459023273a5667be))
- Add hci adapter cleanup ([244420b](https://github.com/modum-io/noble2/commit/244420b6827b79db8acd82fbc30b65856e00c8a8))
- Add known services, characteristics & descriptors ([8d1a257](https://github.com/modum-io/noble2/commit/8d1a2575e8e00b4f2b10dae09a948cbf5edc1af4))
- Add more logs while connecting ([1d56a35](https://github.com/modum-io/noble2/commit/1d56a3517c1d27ec059c0248e0281875142550f0))
- Add more typings ([539cba3](https://github.com/modum-io/noble2/commit/539cba30842e7e2f65b17ff6c709dbdcd80c0420))
- Add stop scan to tests ([de28850](https://github.com/modum-io/noble2/commit/de288504078371c087dc06bc5078485c92694850))
- Add timeout to init ([c238ce0](https://github.com/modum-io/noble2/commit/c238ce0cbb748568ac6559ffdf5b5e5af237101e))
- Add transpiled files ([e2a2d2d](https://github.com/modum-io/noble2/commit/e2a2d2d58b88400728d117ee9bc9f64485a5d80c))
- Add transpiled files ([e318a56](https://github.com/modum-io/noble2/commit/e318a56f76fb16b926e7f51f8b72d06406698a6e))
- Add transpiled files ([26cd9e8](https://github.com/modum-io/noble2/commit/26cd9e81fa9c30d89ce2d80cc302e9662ce081eb))
- Add transpiled files ([4ecf310](https://github.com/modum-io/noble2/commit/4ecf3102063c1e12ef6f1c6e25a12f6d24211d7f))
- Add transpiled files ([cb2f8db](https://github.com/modum-io/noble2/commit/cb2f8dbb1f2d8661ddbb8b43e7a953c01c767717))
- Assume default noble multi role ([7f8a94c](https://github.com/modum-io/noble2/commit/7f8a94c49b74ffe42505a13d64db141398b73986))
- Catch disconnect during connect ([6e690f7](https://github.com/modum-io/noble2/commit/6e690f794cfb869effbb4b2ee943b791bd5709ec))
- Change characteristic discover ([dbc9fdf](https://github.com/modum-io/noble2/commit/dbc9fdf9a7db607ea2335ebd8c3c9accdbda0a26))
- Change default exports ([eafe9df](https://github.com/modum-io/noble2/commit/eafe9df801320b2f23d0d836c397db2c44707f85))
- Correctly dispose peripheral ([d168201](https://github.com/modum-io/noble2/commit/d168201f1de30a6f4015ca328e78846c53e81f44))
- Correctly type function ([187f93e](https://github.com/modum-io/noble2/commit/187f93edc042675e57ba963841dd9d57539e4780))
- Fix adapter address change ([a16918e](https://github.com/modum-io/noble2/commit/a16918e2e376c1b100748d4dbcdb4bf06e5a3bf9))
- Fix adapter init ([d83daee](https://github.com/modum-io/noble2/commit/d83daee08b47da0c3c6152e6fa93457ed31619a7))
- Fix adapter power up ([e807d8b](https://github.com/modum-io/noble2/commit/e807d8b27d41a9d38d600be77cc4e1f8f95c3692))
- Fix adapter startup ([0ee5b5b](https://github.com/modum-io/noble2/commit/0ee5b5b9433b69cff45788054fb63ecb4cbc4495))
- Fix connection processing after disconnect ([d22d2bf](https://github.com/modum-io/noble2/commit/d22d2bfedffc7271bb7f0bba9084fb73e113b50a))
- Fix dbus adapter scan ([eeda964](https://github.com/modum-io/noble2/commit/eeda964bc54e6d951f3bbfc0bb75dd6f673d28e2))
- Fix dbus scanning not working ([7f92f9e](https://github.com/modum-io/noble2/commit/7f92f9ea8b3ce32127a269540ff1e4df430bd02d))
- Fix discovering services ([6338fc8](https://github.com/modum-io/noble2/commit/6338fc896b98f71e39c482254578a699575baf64))
- Fix hci cancel connection command length ([d6edf39](https://github.com/modum-io/noble2/commit/d6edf3904fc184decce58091c91ee1405a80a402))
- Fix hci supervision timeout ([a50cc09](https://github.com/modum-io/noble2/commit/a50cc098b86bed1dd065e24890b3d1b06a23aa8e))
- Fix missing hci status ([2257088](https://github.com/modum-io/noble2/commit/2257088ce36acb37f9c339b0c49d8b6a0e2a4be5))
- Fix not passing on acl data ([7bf04db](https://github.com/modum-io/noble2/commit/7bf04dbccf49bd6650741b66d27953781d3a618e))
- Fix peripheral state ([48d6d51](https://github.com/modum-io/noble2/commit/48d6d517c6d03f62eb8d18b5e0cf0be8fb0adc5c))
- Fix peripheral typings ([91c5521](https://github.com/modum-io/noble2/commit/91c55211bed30ee622e40ed7566ad945f7f4b1b8))
- Fix processing connections after disconnect ([3da6ae4](https://github.com/modum-io/noble2/commit/3da6ae4ce516f37e8d0ca34ffbed1ea1a701ff1b))
- Fix registering multiple handlers on connect ([914b041](https://github.com/modum-io/noble2/commit/914b04166365119792b3a9b1851d5fdf5a1b45bc))
- Fix stuff ([7470826](https://github.com/modum-io/noble2/commit/74708266805e8e222236ee663fd34e691b74c598))
- Fix wrong event return types ([28ce48c](https://github.com/modum-io/noble2/commit/28ce48c88853d87d2cb695ae16ee0b943ba197f9))
- Improve adapter scan resume ([ac8e73b](https://github.com/modum-io/noble2/commit/ac8e73b182f2c5a994c4dfc0c0f6d747b463939f))
- Improve connect behaviour ([87f4bcf](https://github.com/modum-io/noble2/commit/87f4bcf363c074ce3240bddd378e8b562bc54c6e))
- Make state public ([87846a8](https://github.com/modum-io/noble2/commit/87846a82ae78bdeaa4bc64ab8e9e29ad2875ee5a))
- More cleanup fixes ([a3b7c89](https://github.com/modum-io/noble2/commit/a3b7c89614a25713f5a16936296651fb9bf4fb16))
- Move bindings ([093a786](https://github.com/modum-io/noble2/commit/093a786d6ebe891945ad61f6b303eca2f69ea80a))
- Possible fixes for connecting ([e59e593](https://github.com/modum-io/noble2/commit/e59e5933767d3a678363e8f8330ee196d855f026))
- Properly dispose signaling ([afde346](https://github.com/modum-io/noble2/commit/afde346da41a15fc544d68145fbe9aeea7135124))
- Properly implement mtu exchange ([df70614](https://github.com/modum-io/noble2/commit/df7061442741f04441e6b818a38a47a9bb3e7f07))
- Reject after connection error ([7cffc52](https://github.com/modum-io/noble2/commit/7cffc526b13c43513d56e741b7bbfd61701cb914))
- Remove disconnect error handler after connect ([0e5d7ef](https://github.com/modum-io/noble2/commit/0e5d7ef882c4b37e17809cfcb384eb6f969dee5b))
- Remove unused code ([4e00921](https://github.com/modum-io/noble2/commit/4e009214e5334d17f0e42be2c2e5c943406fadbf))
- Wording ([cd23c01](https://github.com/modum-io/noble2/commit/cd23c0137b2105fa9dc23573987b82d84d5e7319))
- **adapter:** Fix restarting scan after connect ([51daa08](https://github.com/modum-io/noble2/commit/51daa080887caeba75835fcfce8a04c0041bf438))
- **adapter:** Fix scanning restart ([48fab1b](https://github.com/modum-io/noble2/commit/48fab1b4a07e3cf290d2944b18c3cbaa47acfa3f))
- **hci:** Fix address being lowercase ([6df4453](https://github.com/modum-io/noble2/commit/6df4453432024d596b1d8e6bf0ec3e6cd06f53e9))
- Rework discover services ([903bbce](https://github.com/modum-io/noble2/commit/903bbce6e5d38b57337705030b1b6fd966a687a2))
- **adapter:** Fix restarting scan ([7d510c8](https://github.com/modum-io/noble2/commit/7d510c826d19ef5824dcec2face5c15d1967d5f6))
- **adapter:** Fix start & stop scanning ([14754c1](https://github.com/modum-io/noble2/commit/14754c19b4ae1e2b4b1cf29a906d800c622572d3))
- Restructure exports ([6c102bf](https://github.com/modum-io/noble2/commit/6c102bf58ddf0cd635256c617ffdeb0b36ebf880))
- Support not setting timeout ([b1f2f39](https://github.com/modum-io/noble2/commit/b1f2f393f8b1c0ff740629d12c14144b6b875207))
