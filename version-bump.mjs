import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

// 执行 npm version patch 来更新版本号
try {
  execSync('npm version patch');
} catch (error) {
  console.error('执行 npm version patch 失败:', error.message);
  process.exit(1);
}

// 重新读取更新后的 package.json
const package_json = JSON.parse(readFileSync('package.json', 'utf8'));
const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));

// 更新 manifest.json 中的版本号
manifest.version = "v" + package_json.version;
writeFileSync('manifest.json', JSON.stringify(manifest, null, 2));

// Git 操作
try {
  execSync('git add manifest.json');
  execSync('git commit -m "chore: sync manifest version"');
  execSync('git push origin main');
  execSync(`git tag -a v${package_json.version} -m "Release v${package_json.version}"`);
  console.log(`版本已更新至 ${package_json.version} 并推送到远程仓库`);
} catch (error) {
  console.error('Git 操作失败:', error.message);
  process.exit(1);
} 