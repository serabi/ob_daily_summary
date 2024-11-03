import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

// 首先读取当前的 package.json
const package_json = JSON.parse(readFileSync('package.json', 'utf8'));
const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));

// 更新 manifest.json 中的版本号（预先更新到下一个版本）
const nextVersion = require('semver').inc(package_json.version, 'patch');
manifest.version = "v" + nextVersion;
writeFileSync('manifest.json', JSON.stringify(manifest, null, 2));

// Git 操作
try {
  // 先提交 manifest 的更改
  execSync('git add manifest.json');
  execSync('git commit -m "chore: bump manifest version"');
  
  // 然后执行 npm version patch，它会创建新的 commit 和 tag
  execSync('npm version patch');
  
  // 最后推送所有更改
  execSync('git push origin main');
  execSync('git push origin --tags');
  
  console.log(`版本已更新至 ${nextVersion} 并推送到远程仓库`);
} catch (error) {
  console.error('Git 操作失败:', error.message);
  process.exit(1);
} 