import { readFileSync, writeFileSync } from 'fs';

const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));
const package_json = JSON.parse(readFileSync('package.json', 'utf8'));

// 从 package.json 获取版本号并添加 'v' 前缀
const version = `v${package_json.version}`;

// 更新 manifest.json 中的版本号（不带 'v' 前缀）
manifest.version = "v" + package_json.version;

writeFileSync('manifest.json', JSON.stringify(manifest, null, 2));

console.log(`Manifest version synced to ${version}`); 