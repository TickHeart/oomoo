## 介绍
我们在蓝湖或者某某ui上下载切图，mac默认是在download文件里面，我们要从download转移到文件夹的assets文件夹中，然后还要改名字。

虽然这个问题我们可以修改浏览器或者其他软件的默认下载路径就可以解决，但是我并不是真的想这么做，用完了还要修改回来，下次用的时候还要接着改。

这很麻烦，我们可以用 `oomoo` 解决问题
## 注意
1. **不支持 windows**
2. 重命名作者并未找到一个好的方案后续补上

## 用法

在使用pi的情况下，请直接执行 `poo` 指令(安装pi)[https://github.com/TickHeart/pi]

并且在您所在的项目根目录创建 `.oomoorc` 配置文件，当然因为是 `pi` 集成，那么就代表你将这些配置写到 `.pirc` 里面也是可取的

```bash
# 需要监听的文件
watchDir=''

# copy|move 文件到指定目录
toDir=''

# 是否覆盖原有的同名文件
overwriteOriginalFile=false

# 选择是移动图片还是复制图片 copy|move
model='move'

# 是否将开启监听前文件夹中的图片转移
collect=false
```
