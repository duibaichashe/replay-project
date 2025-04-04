# Git使用方法说明

## 日常代码更新流程

### 1. 查看当前状态
```bash
git status
```
可以查看哪些文件被修改，哪些文件未被跟踪。

### 2. 添加修改到暂存区
```bash
# 添加单个文件
git add 文件路径

# 添加所有修改
git add .
```

### 3. 提交修改
```bash
git commit -m "提交说明"
```
提交说明应该简洁明了地描述此次修改的内容。

### 4. 将修改推送到GitHub
```bash
git push
```

## 版本回退方法

### 查看提交历史
```bash
# 查看简要历史
git log --oneline

# 查看详细历史
git log
```

### 回退到指定版本
```bash
# 回退到指定的commit
git reset --hard 提交ID

# 例如：回退到上一个版本
git reset --hard HEAD^

# 回退到前两个版本
git reset --hard HEAD~2
```

### 回退后强制推送到远程
```bash
git push -f origin master
```
注意：强制推送会覆盖远程仓库，请谨慎使用。

## 分支操作

### 创建新分支
```bash
git branch 分支名
```

### 切换分支
```bash
git checkout 分支名
```

### 创建并切换到新分支
```bash
git checkout -b 分支名
```

### 合并分支
```bash
# 先切换到目标分支（通常是master）
git checkout master

# 然后合并其他分支到当前分支
git merge 分支名
```

## 其他实用命令

### 撤销工作区修改
```bash
git checkout -- 文件路径
```

### 撤销暂存区修改
```bash
git reset HEAD 文件路径
```

### 只查看某个文件的修改历史
```bash
git log -p 文件路径
```

### 对比两个版本的差异
```bash
git diff 提交ID1 提交ID2
```

### 临时保存当前工作
```bash
# 保存当前工作
git stash

# 查看保存的工作
git stash list

# 恢复最近一次保存的工作
git stash pop
```

## 示例：回退到指定版本

1. 查看提交历史：
```bash
git log --oneline
```

2. 找到要回退的版本ID，例如`a1b2c3d`

3. 执行回退：
```bash
git reset --hard a1b2c3d
```

4. 强制推送到远程仓库（如果需要）：
```bash
git push -f origin master
```
