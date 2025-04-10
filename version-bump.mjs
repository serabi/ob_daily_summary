import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

// get version from package.json
const package_json = JSON.parse(readFileSync('package.json', 'utf8'));
let version = package_json.version;

// modify patch version
version = version.replace(/\.(\d+)$/, (_, p1) => `.${parseInt(p1) + 1}`);

// 更新 manifest.json 中的版本号
const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));
manifest.version = version;
writeFileSync('manifest.json', JSON.stringify(manifest, null, 2));

// update package.json
package_json.version = version;
writeFileSync('package.json', JSON.stringify(package_json, null, 2));

// commit
execSync('git add package.json manifest.json');
execSync(`git commit -m "chore: bump version to ${version}"`);

// set tag
execSync(`git tag -a ${version} -m "Release ${version}"`);

// push
execSync('git push origin main --follow-tags');