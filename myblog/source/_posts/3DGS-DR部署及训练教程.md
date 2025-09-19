---
title: 3DGS-DR部署及训练教程
date: 2025-09-19 20:29:28
tags: 3DGS 
cover: pipeline.png
---
# 3DGS-DR部署及训练教程

![alt text](pipeline.png)

## 项目介绍

​	paper：[3D Gaussian Splatting with Deferred Reflection](https://gapszju.github.io/3DGS-DR/static/pdf/3DGS_DR.pdf)

​	web:[3D Gaussian Splatting with Deferred Reflection](https://gapszju.github.io/3DGS-DR/)

​	github：https://github.com/gapszju/3DGS-DR.git

​	摘要：神经与高斯基辐射场方法的兴起在新视角合成领域取得了巨大成功。然而，镜面反射仍然是一个非平凡的问题，因为高频辐射场 notoriously 难以稳定且准确地拟合。我们提出了一种延迟着色方法，能够有效地利用高斯溅射渲染镜面反射。关键挑战来自于环境贴图反射模型，该模型需要精确的表面法线，同时其不连续的梯度又成为法线估计的瓶颈。我们利用延迟着色生成的逐像素反射梯度，在相邻高斯的优化过程之间架起桥梁，使得近乎正确的法线估计能够逐步传播，最终覆盖所有反射物体。我们的方法在合成高质量镜面反射效果方面显著优于现有最先进技术和同期工作，在合成场景与真实场景中均实现了峰值信噪比（PSNR）的持续提升，同时运行帧率几乎与原始高斯溅射相同。

## 项目部署

### 	首先克隆代码到本地

```bat
git clone https://github.com/gapszju/3DGS-DR.git
```

### 下载项目依赖（必须手动下的）

```bat
pip install submodules/cubemapencoder
pip install submodules/diff-gaussian-rasterization_c3
pip install submodules/diff-gaussian-rasterization_c7
pip install submodules/simple-knn
```

### 下载数据集（点击链接下载）

[Shiny Blender Synthetic](https://storage.googleapis.com/gresearch/refraw360/ref.zip)

 [Shiny Blender Real](https://storage.googleapis.com/gresearch/refraw360/ref_real.zip)

 [Glossy Synthetic](https://liuyuan-pal.github.io/NeRO/)

[NeRF Synthetic dataset](https://drive.google.com/drive/folders/128yBriW1IG_3NJ5Rp7APSTZsJqdJdfc1).

​	

```bat
mkdir data #新建文件夹放数据集
ln -s PATH_TO_DATASET data #创建数据集链接
```

## 训练

### 执行命令并设置自定义选项

```
sh train.sh 
```

你可能需要修改 `train.sh` 中的路径。

`train.py` 的命令行参数说明：

- `--longer_prop_iter`  
  增加法线传播的迭代次数。如果发现默认配置无法很好地完成法线传播，可以设置为 `--longer_prop_iter 24000` 或更高。  
  **默认值：0**

- `--opac_lr0_interval`  
  为了加快法线传播，建议保持默认值 **200**。但在某些情况下，该值可能导致不稳定或质量下降。此时可将其设为 **0**，并将 `--longer_prop_iter` 设为 **36000** 或更高，以获得更好效果。  
  **默认值：200**

- `--densification_interval_when_prop`  
  法线传播过程中的致密化间隔。若场景中主要包含粗糙物体，建议设置为 **100**。  
  **默认值：500**

- `--use_env_scope`  
  针对真实场景，添加此参数以消除背景干扰。`env_scope_center` 和 `env_scope_radius` 用于定义环境光作用的球形区域。

- `--env_scope_center` 与 `--env_scope_radius`  
  定义球形区域的中心与半径，用于限定环境光的作用范围。

## 评价指标

运行以下命令进行评估：

```bash
python eval.py --model_path output/NAME_OF_THE_SCENE #选择训练得到的结果文件夹
```

你将得到 **PSNR、SSIM、LPIPS 和 FPS** 的结果。  
如果需要保存生成的图像和光照结果，请添加参数 `--save_images`：

```bash
python eval.py --model_path output/NAME_OF_THE_SCENE --save_images
---

### 性能更新说明：
我们已进一步优化代码，并重新调整了部分阈值参数。  
- **训练时间**：  
  - 合成数据集：约 **10 分钟**  
  - 真实场景数据集：约 **30 分钟**  
- **平均 FPS** 也有显著提升。
```

## 可视化

我们提供了一个基于 **Dear PyGui** 的简单图形界面查看器。请先安装依赖：

```bash
pip install dearpygui
```

### 启动步骤：

#### 1. 启动服务端：

```bash
python net_viewer.py --model_path output/NAME_OF_THE_SCENE
```

#### 2. 启动客户端：

```bash
cd net_viewer_client
python net_viewer.py
```

---

### 自定义真实场景数据集：

为了获得更好的新视角合成质量，你可能需要指定一个球形区域，用于限定环境光的作用范围。  
**最简单的方法是：**

1. 将初始点云导入 **Blender**；
2. 添加一个球体，覆盖主要反射物体；
3. 使用该球体的 **中心坐标** 和 **半径** 作为训练参数；
4. 具体参数设置请参考前面的《train.py 命令行参数说明》。

## 我在部署过程中遇到的问题以及解决方案

​	*声明：我在部署时候直接在物理机部署，未使用conda和docker，欢迎补充*

### 我想在clone时候使用代理直接将仓库及子模块一起拉下来但是失败了

```python
Traceback (most recent call last):
  File "/home/ljp/cudaProject/3DGS-DR/train.py", line 5, in <module>
    from utils.loss_utils import l1_loss, ssim
  File "/home/ljp/cudaProject/3DGS-DR/utils/loss_utils.py", line 16, in <module>
    from kornia.filters import bilateral_blur
ModuleNotFoundError: No module named 'kornia'
```

> 一句话：**你当前环境里缺 `kornia` 这个 Python 包**，并且 `train.sh` 脚本里还混进了 Windows 风格的换行符，导致 shell 报错 “`: not found`”。
>
> ---
>
> ### ✅ 先解决 **ModuleNotFoundError: No module named 'kornia'**
>
> ```bash
> # 在你激活的 conda 环境里
> pip install kornia
> ```
>
> > 如果已经装过，确认是否装到了 **当前环境**：
> >
> > ```bash
> > which python
> > pip show kornia
> > ```
>
> ---
>
> ### ✅ 再解决 **train.sh: not found**
>
> 这是因为你把 **Windows 下编辑的脚本直接拿到 Linux 上跑**，行尾是 `\r\n`，Linux 只认 `\n`。
>
> #### 两种改法（任选其一）：
>
> #### ① 用 `dos2unix` 一键转格式
>
> ```bash
> sudo apt install dos2unix       # 若未安装
> dos2unix train.sh
> ```
>
> #### ② 手动删 `\r`
>
> ```bash
> sed -i 's/\r$//' train.sh
> ```
>
> 改完再执行：
>
> ```bash
> chmod +x train.sh
> ./train.sh
> ```
>
> ---
>
> ### ✅ 总结：你现在只需要两条命令
>
> ```bash
> pip install kornia
> dos2unix train.sh
> ```
>
> 再重新运行即可。如果还有别的包缺失，把报错贴出来，我继续帮你补。

### 老问题，新缺包：

```python
 from scene.gaussian_model import GaussianModel
  File "/home/ljp/cudaProject/3DGS-DR/scene/__init__.py", line 17, in <module>
    from scene.dataset_readers import sceneLoadTypeCallbacks
  File "/home/ljp/cudaProject/3DGS-DR/scene/dataset_readers.py", line 22, in <module>
    from plyfile import PlyData, PlyElement
```

**`plyfile` 没装**。  
只要在你当前的 conda 环境里执行

```bash
pip install plyfile
```

即可。

### Flask 与 Werkzeug 版本不匹配

```python
 import flask
  File "/home/ljp/anaconda3/lib/python3.10/site-packages/flask/__init__.py", line 5, in <module>
    from .app import Flask as Flask
  File "/home/ljp/anaconda3/lib/python3.10/site-packages/flask/app.py", line 30, in <module>
    from werkzeug.urls import url_quote
ImportError: cannot import name 'url_quote' from 'werkzeug.urls' (/home/ljp/anaconda3/lib/python3.10/site-packages/werkzeug/urls.py)
```

> Flask 与 Werkzeug 版本不匹配：  
> `werkzeug` 新版（3.x）**删掉了** `url_quote`，而旧版 Flask（2.2 及以下）还在用它。
>
> ---
>
> ### ✅ 最快的修复：把 **Werkzeug 降级**到 2.3.x
>
> ```bash
> pip install "werkzeug<3"
> ```
>
> ---
>
> ### 可选但推荐：连带把 Flask 升到最新 2.x（兼容 werkzeug 2.3）
>
> ```bash
> pip install -U "flask<3"   # 当前 2.3.3 即可
> ```
>
> ---
>
> ### 一句话总结
>
> ```bash
> pip install "werkzeug<3"
> ```
>
> 再跑你的脚本，报错消失。

### typing_extensions 版本太新

```python
 File "/home/ljp/anaconda3/lib/python3.10/site-packages/open3d/visualization/draw_plotly.py", line 12, in <module>
    from dash import html
  File "/home/ljp/anaconda3/lib/python3.10/site-packages/dash/__init__.py", line 46, in <module>
    from ._hooks import hooks  # noqa: F401,E402
  File "/home/ljp/anaconda3/lib/python3.10/site-packages/dash/_hooks.py", line 28, in <module>
    class _Hook(_tx.Generic[HookDataType]):
AttributeError: module 'typing_extensions' has no attribute 'Generic'
```

> typing_extensions 版本太新，旧版 Dash 在它里面找不到 `Generic` 导致的崩溃。  
> 一句话：**把 typing_extensions 降级到 4.7.x 以下**即可。
>
> ```bash
> pip install "typing_extensions<4.7"
> ```
>
> 执行完再跑训练，这条 `AttributeError` 就会消失。

> 说明刚才的降级**没生效**或者**被别的包又升级回去了**。  
> 先确认实际安装的版本：
>
> ```bash
> pip show typing_extensions | grep Version
> ```
>
> 如果 ≥ 4.7，就**强制卸干净再装旧版**：
>
> ```bash
> pip uninstall -y typing_extensions
> pip install "typing_extensions==4.6.3"
> ```
>
> **关键点**：  
>
> 1. 一定要**先卸再装**，否则可能残留高版本缓存。  
> 2. 装完再验证：
>
> ```bash
> python -c "import typing_extensions,sys; print(typing_extensions.__version__)"
> ```
>
> 只要显示 `4.6.3`（或 <4.7），再跑训练就不会再报 `AttributeError: module 'typing_extensions' has no attribute 'Generic'`。

### `open3d` 在 **可视化子模块** 里 **强行 `import dash`**

```python
   from .draw_plotly import draw_plotly
  File "/home/ljp/anaconda3/lib/python3.10/site-packages/open3d/visualization/draw_plotly.py", line 12, in <module>
    from dash import html
  File "/home/ljp/anaconda3/lib/python3.10/site-packages/dash/__init__.py", line 46, in <module>
    from ._hooks import hooks  # noqa: F401,E402
  File "/home/ljp/anaconda3/lib/python3.10/site-packages/dash/_hooks.py", line 28, in <module>
    class _Hook(_tx.Generic[HookDataType]):
AttributeError: module 'typing_extensions' has no attribute 'Generic
```

> 问题根源  
> `open3d` 在 **可视化子模块** 里 **强行 `import dash`**，而你的 Dash 版本仍 **老到去 `typing_extensions.Generic` 里找别名**，**4.4.0 的 typing_extensions 已没有这个别名**，于是循环报错。
>
> ---
>
> ### 一次性根治：把 Dash 升到 **2.14+**（已适配新旧 typing_extensions）
>
> ```bash
> pip install -U "dash>=2.14"
> ```
>
> ---
>
> ### 验证
>
> ```bash
> python -c "import dash, typing_extensions, sys; print('dash:', dash.__version__, 'typing_extensions:', typing_extensions.__version__)"
> ```
>
> 能正常 import 就说明解决。  
> 再执行
>
> ```bash
> sh train.sh
> ```
>
> 报错会消失。

> 说明 Dash 还没升上去，或者升级失败又回落了。  
> **先强制把 Dash 升到 2.14+**，再确认：
>
> ```bash
> # 1. 卸干净旧版
> pip uninstall -y dash
> 
> # 2. 装最新 2.x（已修复 Generic 问题）
> pip install "dash>=2.14,<3"
> 
> # 3. 验证
> python -c "import dash, typing_extensions; print(dash.__version__, typing_extensions.__version__)"
> ```
>
> 只要 dash 版本 ≥2.14，就不会再去找 `typing_extensions.Generic`，报错即消失。

> `typing_extensions` 4.4.0 本身**没有 `__version__` 属性**，所以最后一行报错是**正常副作用**，**不代表 Dash 问题仍在**。
>
> 先**直接验证 Dash 能否正常 import**：
>
> ```bash
> python -c "import dash; print('dash:', dash.__version__)"
> ```
>
> - 如果输出版本号 ≥2.14 → **Dash 已修复**，可以继续跑训练；  
> - 如果仍抛 `AttributeError: module 'typing_extensions' has no attribute 'Generic'` → **Dash 还是旧版**，继续执行：
>
> ```bash
> pip uninstall -y dash
> pip install "dash==2.17.0"
> ```
>
> 再跑一次即可。

### 你系统自带的 `glibc` 版本 **低于 2.29**

```
Traceback (most recent call last):
  File "/home/ljp/cudaProject/3DGS-DR/net_viewer_client/net_viewer.py", line 3, in <module>
    import dearpygui.dearpygui as dpg
  File "/home/ljp/anaconda3/lib/python3.10/site-packages/dearpygui/dearpygui.py", line 22, in <module>
    import dearpygui._dearpygui as internal_dpg
ImportError: /lib/x86_64-linux-gnu/libm.so.6: version `GLIBC_2.29' not found (required by /home/ljp/anaconda3/lib/python3.10/site-packages/dearpygui/_dearpygui.so)怎么回事
```

> 报错说明：
>
> 你系统自带的 `glibc` 版本 **低于 2.29**，而当前 `dearpygui` 轮子是 **用 glibc-2.29 链接的**，所以运行时找不到符号，抛 `version 'GLIBC_2.29' not found`。
>
> ---
>
> ### ✅ 最简、最安全方案（**优先降级 dearpygui**）
>
> 官方已确认 **1.7.x 及更早版本** 是用 **glibc 2.27 及以下** 构建的，直接降版即可：
>
> ```bash
> pip uninstall -y dearpygui
> pip install dearpygui==1.7.1
> ```
>
> 降完后重新运行客户端：
>
> ```bash
> cd net_viewer_client
> python net_viewer.py
> ```
>
> 若不再报错即解决；如仍提示 `GLIBC_2.29` 则继续降到 **1.6.x**：
>
> ```bash
> pip install dearpygui==1.6
> ```
>
> ---
>
> ### ⚠️ 备选方案（**仅当降级失败才考虑**）
>
> 自己编译/升级 **glibc-2.29** 风险高，容易把系统命令弄坏；**非必要不推荐**。  
> 如确实需要，参考：
>
> ```bash
> # 新建隔离目录，编译安装
> wget http://ftp.gnu.org/gnu/glibc/glibc-2.29.tar.gz
> tar -xf glibc-2.29.tar.gz && cd glibc-2.29
> mkdir build && cd build
> ../configure --prefix=/usr/local/glibc-2.29 --disable-profile --enable-add-ons
> make -j$(nproc)
> sudo make install
> 
> # 仅对当前会话生效，不影响系统
> export LD_LIBRARY_PATH=/usr/local/glibc-2.29/lib:$LD_LIBRARY_PATH
> python net_viewer.py
> ```
>
> > 千万别直接替换 `/lib/x86_64-linux-gnu/libm.so.6`，否则系统命令会集体失效。
>
> ---
>
> ### 一句话结论
>
> **先降 `dearpygui` 版本 → 1.7.1（或 1.6）就能直接跑**，10 秒搞定；**别急着升级 glibc**。

## 注意事项

在 **3DGS-DR** 里，“中途结果”= 两个东西：

1. 中间迭代时刻的 **模型参数**（`.ply` + 优化器状态）  
2. 对应的 **指标/图片**（PSNR、SSIM、LPIPS 等，可选）

仓库已经自带了 **checkpoint + 中间测试** 机制，只要给对参数即可**自动保存**；无需改代码。

---

### 一、保存中间 **模型快照**（checkpoint）

`train.py` 预留了专门的参数：

| 参数                      | 作用                   | 示例                                       |
| ------------------------- | ---------------------- | ------------------------------------------ |
| `--checkpoint_iterations` | 想在哪几轮保存 `.ckpt` | `--checkpoint_iterations 7000 15000 25000` |
| `--save_iterations`       | 想在哪几轮导出 `.ply`  | `--save_iterations 7000 15000 25000`       |

**用法示例**  

```bash
python train.py -s data/toaster -m output/toaster \
       --save_iterations     7000 15000 25000 \
       --checkpoint_iterations 7000 15000 25000
```

**保存路径**  

- `.ply` 模型 → `output/toaster/point_cloud/iteration_7000/`  
- 完整 checkpoint → `output/toaster/chkpnt7000.pth`  
  （含高斯参数、优化器状态，可**断点续训**）

---

### 二、保存中间 **测试图像 / 指标**

仓库提供了 `eval.py`，可在**任意迭代**把当前模型拉出来测一遍并落盘。

1. 训练时把要测的迭代写进 `--test_iterations`  

   ```bash
   python train.py ... --test_iterations 7000 15000 25000
   ```

   训练到这些轮次会自动跑测试，**只打印指标**，**不存图**。

2. 如果想**把图也存下来**，再单跑：

   ```bash
   python eval.py --model_path output/toaster \
                  --iteration 7000 \
                  --save_images
   ```

   会在  
   `output/toaster/test/iteration_7000/`  
   里生成 `0000.png ~ XXXX.png` 以及 `gt_0000.png` 等对照图。

---

### 三、断点续训（可选）

如果训练被中断，用 **start_checkpoint** 继续：

```bash
python train.py -s data/toaster -m output/toaster \
       --start_checkpoint output/toaster/chkpnt15000.pth
```

---

### 四、一句话总结

**想自动保存中途结果** → 在训练命令里加

```bash
--save_iterations 7000 15000 25000 \
--checkpoint_iterations 7000 15000 25000 \
--test_iterations 7000 15000 25000
```

**想同时落盘图片** → 训练完再

```bash
python eval.py --model_path output/xxx --iteration YYYY --save_images
```

全程无需改代码，参数给够即可。