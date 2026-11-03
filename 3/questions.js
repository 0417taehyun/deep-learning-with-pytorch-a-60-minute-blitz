// Quiz questions for "Training a Classifier (CIFAR-10)".
// Loaded by quiz.html in this folder and by ../main.html (quiz home + mixed practice).
//
// Format: each question has an id (unique across all chapters), tag "tutorial" | "beyond",
// bilingual { ko, en } text, and 4 options with exactly one `ok: true`. Every option has a `why`.
// Optional: `code` (shown under the question), `tryit` (runnable snippet shown after answering).
// Text supports `inline code`, **bold**, "- " bullet lines, and blank-line paragraphs.
(window.QUIZ_CHAPTERS = window.QUIZ_CHAPTERS || []).push({
  id: "cifar10-classifier",
  dir: "3",
  title: { ko: "분류기 학습하기 (CIFAR-10)", en: "Training a Classifier (CIFAR-10)" },
  summary: { ko: "CIFAR-10 로딩·정규화, CNN의 shape, 손실 함수와 학습 루프, 저장·평가, GPU 학습", en: "Loading & normalizing CIFAR-10, CNN shapes, loss & training loop, saving & evaluating, GPU training" },
  source: "https://docs.pytorch.org/tutorials/beginner/blitz/cifar10_tutorial.html",
  questions: [
    {
      id: "c1", tag: "tutorial",
      topic: { ko: "CIFAR-10 데이터의 shape", en: "Shape of CIFAR-10 batches" },
      q: {
        ko: "`batch_size = 4`인 `trainloader`에서 `images, labels = next(iter(trainloader))`로 꺼낸 배치의 shape은?",
        en: "With `batch_size = 4`, what shapes does `images, labels = next(iter(trainloader))` give?"
      },
      options: [
        {
          ok: true,
          t: "`images`: (4, 3, 32, 32) / `labels`: (4,)",
          why: {
            ko: "CIFAR-10은 3채널(RGB) 32×32 이미지입니다. PyTorch는 **(N, C, H, W)** 순서를 쓰고, 레이블은 이미지마다 클래스 번호(0~9) 하나라서 (4,)예요.",
            en: "CIFAR-10 images are 3-channel (RGB) 32×32. PyTorch uses **(N, C, H, W)** order, and each image has one class index (0–9), so labels are (4,)."
          }
        },
        {
          t: "`images`: (4, 32, 32, 3) / `labels`: (4,)",
          why: {
            ko: "(H, W, C)는 PIL·NumPy·matplotlib의 순서입니다. transform을 거친 PyTorch 텐서는 채널이 앞에 와요. 그래서 튜토리얼의 `imshow`가 `np.transpose(npimg, (1, 2, 0))`으로 순서를 바꾼 뒤에 그립니다.",
            en: "(H, W, C) is the PIL/NumPy/matplotlib order. After the transform, PyTorch tensors are channel-first, which is why the tutorial's `imshow` calls `np.transpose(npimg, (1, 2, 0))` before plotting."
          }
        },
        {
          t: "`images`: (3, 32, 32, 4) / `labels`: (4,)",
          why: {
            ko: "배치 차원(N)은 항상 맨 앞에 옵니다.",
            en: "The batch dimension (N) always comes first."
          }
        },
        {
          t: "`images`: (4, 3, 32, 32) / `labels`: (4, 10)",
          why: {
            ko: "레이블은 원-핫 벡터가 아니라 정수 클래스 인덱스입니다. 튜토리얼에서 `classes[labels[j]]`로 클래스 이름을 찾을 수 있는 이유예요.",
            en: "Labels are integer class indices, not one-hot vectors. That's why the tutorial can look up names with `classes[labels[j]]`."
          }
        }
      ],
      explain: {
        ko: "CIFAR-10: 10개 클래스(`plane`, `car`, `bird`, `cat`, `deer`, `dog`, `frog`, `horse`, `ship`, `truck`), 3×32×32 컬러 이미지, 학습용 50,000장 / 테스트용 10,000장.\n\nPyTorch 이미지 텐서의 표준 순서는 **(배치, 채널, 높이, 너비) = NCHW**입니다. matplotlib으로 그릴 땐 HWC로 바꿔야 해요.",
        en: "CIFAR-10: 10 classes (`plane`, `car`, `bird`, `cat`, `deer`, `dog`, `frog`, `horse`, `ship`, `truck`), 3×32×32 color images, 50,000 for training / 10,000 for testing.\n\nPyTorch's standard image layout is **(batch, channel, height, width) = NCHW**. Convert to HWC for matplotlib."
      },
      tryit: `
images, labels = next(iter(trainloader))
print(images.shape, images.dtype)   # torch.Size([4, 3, 32, 32]) torch.float32
print(labels, labels.dtype)         # e.g. tensor([4, 2, 2, 3]) torch.int64
print([classes[l] for l in labels])
`
    },
    {
      id: "c2", tag: "tutorial",
      topic: { ko: "정규화 (Normalize)", en: "Normalization" },
      q: {
        ko: "`ToDtype(..., scale=True)` 직후 어떤 픽셀 값이 0.25였다면, `Normalize`를 거친 최종 값은?",
        en: "If a pixel is 0.25 right after `ToDtype(..., scale=True)`, what is its final value after `Normalize`?"
      },
      code: `
transform = v2.Compose([
    v2.ToImage(),
    v2.ToDtype(torch.float32, scale=True),
    v2.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))])
`,
      options: [
        {
          ok: true,
          t: "`-0.5`",
          why: {
            ko: "Normalize는 채널마다 (x − mean) / std를 계산합니다: (0.25 − 0.5) / 0.5 = −0.5.",
            en: "Normalize computes (x − mean) / std per channel: (0.25 − 0.5) / 0.5 = −0.5."
          }
        },
        {
          t: "`0.25`",
          why: {
            ko: "Normalize가 값을 그대로 둔다면 이렇겠지만, 실제로는 채널마다 (x − mean) / std를 적용합니다.",
            en: "That would be true if Normalize left values alone, but it applies (x − mean) / std per channel."
          }
        },
        {
          t: "`-0.25`",
          why: {
            ko: "0.25 − 0.5까지만 계산하고 std(0.5)로 나누는 걸 빠뜨렸습니다.",
            en: "This stops at 0.25 − 0.5 and forgets to divide by the std (0.5)."
          }
        },
        {
          t: "`0.625`",
          why: {
            ko: "역정규화 공식 x × 0.5 + 0.5를 적용한 값입니다. 튜토리얼 `imshow`의 `img / 2 + 0.5`가 바로 이 역방향 변환이에요.",
            en: "That applies the *inverse* formula x × 0.5 + 0.5. The tutorial's `imshow` uses exactly this, `img / 2 + 0.5`, to un-normalize."
          }
        }
      ],
      explain: {
        ko: "- `ToImage()`: PIL 이미지 → 텐서 이미지 (C, H, W)\n- `ToDtype(torch.float32, scale=True)`: 0~255 정수 → 0~1 실수\n- `Normalize(mean, std)`: 채널마다 (x − mean) / std → 0~1 범위가 **−1~1**로\n\n입력값을 0 근처에 모아 주면 학습이 안정적입니다. 실전에서는 데이터셋의 실제 채널별 평균·표준편차를 많이 써요 (예: ImageNet의 `(0.485, 0.456, 0.406)`, `(0.229, 0.224, 0.225)`).",
        en: "- `ToImage()`: PIL image → tensor image (C, H, W)\n- `ToDtype(torch.float32, scale=True)`: 0–255 integers → 0–1 floats\n- `Normalize(mean, std)`: (x − mean) / std per channel → 0–1 becomes **−1–1**\n\nCentering inputs around 0 makes training more stable. In practice, people often use the dataset's real per-channel mean and std (e.g. ImageNet's `(0.485, 0.456, 0.406)`, `(0.229, 0.224, 0.225)`)."
      },
      tryit: `
from torchvision.transforms import v2
norm = v2.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
x = torch.full((3, 1, 1), 0.25)
print(norm(x).flatten())            # tensor([-0.5, -0.5, -0.5])
print(norm(x).flatten() / 2 + 0.5)  # back to 0.25
`
    },
    {
      id: "c3", tag: "tutorial",
      topic: { ko: "DataLoader와 shuffle", en: "DataLoader and shuffle" },
      q: {
        ko: "튜토리얼은 `trainloader`에는 `shuffle=True`, `testloader`에는 `shuffle=False`를 씁니다. 그 이유로 가장 알맞은 것은?",
        en: "The tutorial uses `shuffle=True` for `trainloader` and `shuffle=False` for `testloader`. What's the best explanation?"
      },
      options: [
        {
          ok: true,
          t: { ko: "학습은 데이터 순서에 의존하지 않도록 섞고, 테스트는 순서가 정확도에 영향이 없어 섞지 않는다", en: "Shuffling keeps training from depending on order; test order doesn't affect accuracy" },
          why: {
            ko: "예를 들어 데이터가 클래스별로 정렬되어 있으면, 섞지 않을 경우 한동안 '고양이'만 보고 학습하게 되어 기울기가 한쪽으로 치우칩니다.",
            en: "If the data were sorted by class, an unshuffled model would see only 'cats' for a while, and the gradients would be biased."
          }
        },
        {
          t: { ko: "`shuffle=True`는 이미지를 무작위로 회전하거나 뒤집어서 학습 데이터를 늘려 주기 때문이다", en: "`shuffle=True` augments the training data by randomly rotating or flipping images" },
          why: {
            ko: "셔플은 순서만 바꿉니다. 데이터 증강은 `v2.RandomHorizontalFlip()` 같은 transform으로 해요.",
            en: "Shuffling only changes the order. Augmentation is done with transforms like `v2.RandomHorizontalFlip()`."
          }
        },
        {
          t: { ko: "테스트 데이터를 섞으면 미니배치 구성이 달라져서 측정되는 정확도가 낮아지기 때문이다", en: "Shuffling test data changes how batches are formed, which lowers the measured accuracy" },
          why: {
            ko: "평가 중에는 가중치가 바뀌지 않으므로 어떤 순서로 봐도 정확도는 같습니다. 순서를 고정하면 결과를 재현하고 비교하기 쉬울 뿐이에요.",
            en: "Weights don't change during evaluation, so accuracy is identical in any order. A fixed order just makes results easier to reproduce and compare."
          }
        },
        {
          t: { ko: "`torch.no_grad()`는 `shuffle=False`인 DataLoader에서만 동작하기 때문이다", en: "`torch.no_grad()` only works with a DataLoader that has `shuffle=False`" },
          why: {
            ko: "`no_grad`와 DataLoader 설정은 아무 관계가 없습니다.",
            en: "`no_grad` has nothing to do with DataLoader settings."
          }
        }
      ],
      explain: {
        ko: "**DataLoader**는 Dataset을 감싸서 (1) 배치로 묶고 (2) 섞고 (3) `num_workers`개의 프로세스로 병렬 로딩해 줍니다.\n\n학습용은 `shuffle=True`, 검증·테스트용은 `shuffle=False`가 정석이에요.",
        en: "A **DataLoader** wraps a Dataset to (1) group samples into batches, (2) shuffle them, and (3) load them in parallel with `num_workers` processes.\n\nThe standard setup is `shuffle=True` for training and `shuffle=False` for validation/testing."
      }
    },
    {
      id: "c4", tag: "beyond",
      topic: { ko: "macOS에서 num_workers 에러", en: "num_workers errors on macOS" },
      q: {
        ko: "macOS에서 `main.py`를 실행했더니 `num_workers=2`인 DataLoader에서 `RuntimeError: An attempt has been made to start a new process before the current process has finished its bootstrapping phase...` 에러가 났습니다. 원인과 해결책은?",
        en: "Running `main.py` on macOS, the DataLoader with `num_workers=2` raises `RuntimeError: An attempt has been made to start a new process before the current process has finished its bootstrapping phase...`. What's the cause and fix?"
      },
      options: [
        {
          ok: true,
          t: { ko: "워커가 스크립트를 다시 import하기 때문이므로, 코드를 `if __name__ == '__main__':`로 감싼다", en: "Workers re-import your script, so wrap the code in `if __name__ == '__main__':`" },
          why: {
            ko: "보호 구문이 없으면 각 워커가 `main.py`를 import하면서 DataLoader를 또 만들고 워커를 또 띄우려 해서 에러가 납니다. 튜토리얼도 Windows·macOS에서 이 에러가 나면 `num_workers=0`으로 하라고 안내해요.",
            en: "Without the guard, each worker imports main.py, builds another DataLoader, and tries to start more workers. The tutorial also says to set `num_workers=0` if you hit this on Windows or macOS."
          }
        },
        {
          t: { ko: "워커 여러 개가 데이터를 한꺼번에 올려 GPU(MPS) 메모리가 부족해진 것이므로 `batch_size`를 줄인다", en: "Several workers loading data at once exhausted MPS memory, so reduce `batch_size`" },
          why: {
            ko: "메모리 부족이면 'out of memory' 류의 에러가 납니다. 이 에러는 프로세스 생성 방식의 문제예요.",
            en: "Running out of memory gives an 'out of memory'-type error. This one is about how processes are created."
          }
        },
        {
          t: { ko: "워커가 시작될 때 CIFAR-10 파일이 아직 다운로드되지 않은 상태라서 `download=True`를 추가해야 한다", en: "The CIFAR-10 files weren't downloaded yet when the workers started, so add `download=True`" },
          why: {
            ko: "데이터가 없으면 'Dataset not found' 류의 에러가 납니다.",
            en: "Missing data gives a 'Dataset not found'-type error."
          }
        },
        {
          t: { ko: "`num_workers`는 CPU 코어 수와 정확히 같아야 하므로 `os.cpu_count()` 값으로 맞춰야 한다", en: "`num_workers` must exactly match the CPU core count, so set it to `os.cpu_count()`" },
          why: {
            ko: "`num_workers`는 0 이상이면 어떤 값이든 됩니다. 개수가 아니라 프로세스 시작 방식의 문제예요.",
            en: "`num_workers` can be any non-negative number. The issue is how processes start, not how many there are."
          }
        }
      ],
      explain: {
        ko: "멀티프로세싱(DataLoader의 `num_workers > 0`)을 쓰는 스크립트는 실행 코드를 `if __name__ == '__main__':` 아래에 두는 습관을 들이세요. macOS·Windows는 기본 시작 방식이 `spawn`이라 이 보호 구문이 꼭 필요합니다 (지금 쓰는 Python 3.12 + macOS 환경이 바로 `spawn`이에요). Linux는 예전부터 `fork`라 문제가 덜했지만, Python 3.14부터는 Linux 기본값도 `forkserver`로 바뀌어서 어느 OS든 보호 구문을 쓰는 습관이 안전해요.\n\n아래 구조처럼 학습 코드를 `main()` 함수로 감싸면 돼요.",
        en: "Any script that uses multiprocessing (DataLoader with `num_workers > 0`) should keep its executable code under `if __name__ == '__main__':`. macOS and Windows default to `spawn`, where the guard is required (your Python 3.12 + macOS setup uses `spawn`). Linux traditionally used `fork`, so it was less of an issue there, but since Python 3.14 Linux defaults to `forkserver` too, so the guard is a safe habit on every OS.\n\nJust wrap your training code in a `main()` function, as below."
      },
      tryit: `
import torch
import torchvision
from torchvision.transforms import v2

def main():
    transform = v2.Compose([v2.ToImage(), v2.ToDtype(torch.float32, scale=True),
                            v2.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))])
    trainset = torchvision.datasets.CIFAR10(root='./data', train=True,
                                            download=True, transform=transform)
    trainloader = torch.utils.data.DataLoader(trainset, batch_size=4,
                                              shuffle=True, num_workers=2)
    # ... define net, loss, optimizer, training loop ...

if __name__ == '__main__':
    main()
`
    },
    {
      id: "c5", tag: "tutorial",
      topic: { ko: "CNN의 shape 추적", en: "Tracing shapes through the CNN" },
      q: {
        ko: "입력 `x`의 shape이 `(4, 3, 32, 32)`일 때, `torch.flatten` 직전(`# <- here`) `x`의 shape은?",
        en: "If the input `x` has shape `(4, 3, 32, 32)`, what is its shape right before `torch.flatten` (`# <- here`)?"
      },
      code: `
self.conv1 = nn.Conv2d(3, 6, 5)
self.pool = nn.MaxPool2d(2, 2)
self.conv2 = nn.Conv2d(6, 16, 5)
self.fc1 = nn.Linear(16 * 5 * 5, 120)

def forward(self, x):
    x = self.pool(F.relu(self.conv1(x)))
    x = self.pool(F.relu(self.conv2(x)))
    # <- here
    x = torch.flatten(x, 1)
    ...
`,
      options: [
        {
          ok: true,
          t: "`(4, 16, 5, 5)`",
          why: {
            ko: "32 → conv(5×5) → 28 → pool → 14 → conv(5×5) → 10 → pool → 5. 채널 수는 마지막 conv의 출력인 16이에요. 그래서 `fc1`의 입력 크기가 `16 * 5 * 5 = 400`입니다.",
            en: "32 → conv(5×5) → 28 → pool → 14 → conv(5×5) → 10 → pool → 5, with 16 channels from the last conv. That's why `fc1` takes `16 * 5 * 5 = 400` inputs."
          }
        },
        {
          t: "`(4, 16, 10, 10)`",
          why: {
            ko: "두 번째 풀링을 빼먹었습니다. 10 → pool → 5가 되어야 해요.",
            en: "This skips the second pooling: 10 → pool → 5."
          }
        },
        {
          t: "`(4, 6, 14, 14)`",
          why: {
            ko: "첫 번째 conv + pool까지만 통과했을 때의 shape입니다.",
            en: "That's the shape after only the first conv + pool."
          }
        },
        {
          t: "`(4, 16, 4, 4)`",
          why: {
            ko: "28×28 입력(MNIST 크기)일 때의 결과입니다: 28 → 24 → 12 → 8 → 4. CIFAR-10은 32×32예요.",
            en: "That's what a 28×28 input (MNIST size) gives: 28 → 24 → 12 → 8 → 4. CIFAR-10 is 32×32."
          }
        }
      ],
      explain: {
        ko: "**출력 크기 공식**: ⌊(입력 + 2×padding − kernel) / stride⌋ + 1\n- `Conv2d(·, ·, 5)` (padding 0, stride 1): 크기 − 4\n- `MaxPool2d(2, 2)`: 크기 ÷ 2\n\n`nn.Linear`의 입력 크기는 직접 계산해서 넣어야 하므로, 이 흐름을 손으로 따라가 보는 연습이 중요해요. 헷갈리면 forward 중간에 `print(x.shape)`를 넣어 보세요.",
        en: "**Output size formula**: ⌊(input + 2×padding − kernel) / stride⌋ + 1\n- `Conv2d(·, ·, 5)` (padding 0, stride 1): size − 4\n- `MaxPool2d(2, 2)`: size ÷ 2\n\nYou must compute `nn.Linear`'s input size yourself, so practice tracing this by hand. When in doubt, drop a `print(x.shape)` into forward."
      }
    },
    {
      id: "c6", tag: "tutorial",
      topic: { ko: "flatten과 배치 차원", en: "flatten and the batch dimension" },
      q: {
        ko: "`x`의 shape이 `(4, 16, 5, 5)`일 때, `torch.flatten(x, 1)` 대신 `torch.flatten(x)`로 쓰면 무엇이 문제일까요?",
        en: "With `x` of shape `(4, 16, 5, 5)`, what goes wrong if you write `torch.flatten(x)` instead of `torch.flatten(x, 1)`?"
      },
      options: [
        {
          ok: true,
          t: { ko: "배치 차원까지 펴져 `(1600,)`이 되고, `fc1`에서 shape 에러가 난다", en: "The batch dim is flattened too, giving `(1600,)`, and `fc1` raises a shape error" },
          why: {
            ko: "`start_dim=1`은 '0번 차원(배치)은 그대로 두고 그 뒤만 펴라'는 뜻입니다. `(4, 400)`이어야 이미지마다 400개 특징을 가진 벡터가 돼요. 실제 에러: `mat1 and mat2 shapes cannot be multiplied (1x1600 and 400x120)`.",
            en: "`start_dim=1` means 'keep dim 0 (the batch) and flatten everything after it'. You need `(4, 400)`: one 400-feature vector per image. The actual error: `mat1 and mat2 shapes cannot be multiplied (1x1600 and 400x120)`."
          }
        },
        {
          t: { ko: "아무 문제 없다. 기본값이 배치 차원을 남기므로 결과는 똑같이 `(4, 400)`이다", en: "No problem. The default keeps the batch dim, so the result is still `(4, 400)`" },
          why: {
            ko: "`torch.flatten`의 기본 `start_dim`은 0이라 모든 차원을 폅니다.",
            en: "`torch.flatten` defaults to `start_dim=0`, so it flattens every dimension."
          }
        },
        {
          t: { ko: "`(4, 16, 25)`가 되어 `fc1`의 입력이 16개가 된다", en: "It becomes `(4, 16, 25)`, so `fc1` gets 16 inputs" },
          why: {
            ko: "그건 `torch.flatten(x, 2)`의 결과입니다.",
            en: "That's what `torch.flatten(x, 2)` gives."
          }
        },
        {
          t: { ko: "채널 값들이 하나로 합쳐져서 흑백 이미지처럼 정보가 손실된다", en: "Channel values get merged into one, losing information as if the image became grayscale" },
          why: {
            ko: "flatten은 값을 그대로 둔 채 배열의 모양만 바꿉니다. 값이 합쳐지거나 사라지지 않아요.",
            en: "flatten only reshapes; it keeps every value. Nothing is merged or lost."
          }
        }
      ],
      explain: {
        ko: "PyTorch의 `nn` 레이어는 항상 **첫 번째 차원을 배치**로 취급합니다. 그래서 펼칠 때도 배치 차원은 남겨야 해요.\n\n`x.view(x.size(0), -1)`이나 `nn.Flatten()`(기본 `start_dim=1`)도 같은 결과를 냅니다.",
        en: "PyTorch `nn` layers always treat the **first dimension as the batch**, so flattening must keep it.\n\n`x.view(x.size(0), -1)` and `nn.Flatten()` (default `start_dim=1`) give the same result."
      },
      tryit: `
x = torch.randn(4, 16, 5, 5)
print(torch.flatten(x).shape)      # torch.Size([1600])
print(torch.flatten(x, 1).shape)   # torch.Size([4, 400])
print(nn.Flatten()(x).shape)       # torch.Size([4, 400])
`
    },
    {
      id: "c7", tag: "beyond",
      topic: { ko: "CrossEntropyLoss와 logits", en: "CrossEntropyLoss and logits" },
      q: {
        ko: "`nn.CrossEntropyLoss`를 쓸 때 `Net.forward`의 마지막에 `F.softmax(x, dim=1)`를 추가해야 할까요?",
        en: "When using `nn.CrossEntropyLoss`, should you add `F.softmax(x, dim=1)` at the end of `Net.forward`?"
      },
      options: [
        {
          ok: true,
          t: { ko: "아니다. 내부에서 `log_softmax`를 적용하므로 logits를 그대로 넣으면 된다", en: "No. It applies `log_softmax` internally, so pass the raw logits" },
          why: {
            ko: "`CrossEntropyLoss` = `LogSoftmax` + `NLLLoss`입니다. 튜토리얼처럼 `fc3`의 출력을 그대로 넣는 게 맞아요.",
            en: "`CrossEntropyLoss` = `LogSoftmax` + `NLLLoss`. Passing `fc3`'s output directly, as the tutorial does, is correct."
          }
        },
        {
          t: { ko: "그렇다. 손실 함수에는 합이 1인 확률 분포를 넣어야 올바르게 계산된다", en: "Yes. The loss is only correct when given probabilities that sum to 1" },
          why: {
            ko: "softmax를 넣으면 softmax가 **두 번** 적용되는 셈이라 손실이 왜곡되고 학습이 느려집니다. 예: logits `[2.0, 0.5, -1.0]`, 정답 0 → 올바른 손실 0.241, softmax를 먼저 하면 0.702.",
            en: "Adding softmax effectively applies it **twice**, distorting the loss and slowing learning. E.g. logits `[2.0, 0.5, -1.0]` with target 0 → correct loss 0.241, but 0.702 with softmax first."
          }
        },
        {
          t: { ko: "아니다. 다만 레이블을 원-핫 벡터(`(4, 10)` float)로 바꿔서 줘야 한다", en: "No, but labels must be converted to one-hot vectors (`(4, 10)` floats)" },
          why: {
            ko: "기본 사용법은 shape `(N,)`인 정수(`int64`) 클래스 인덱스입니다. 튜토리얼도 DataLoader의 `labels`를 그대로 넣어요. (클래스별 확률 분포를 target으로 주는 방식도 지원하지만 필수는 아닙니다.)",
            en: "The standard usage is integer (`int64`) class indices of shape `(N,)`. The tutorial passes the DataLoader's `labels` directly. (Class-probability targets are also supported, but not required.)"
          }
        },
        {
          t: { ko: "그렇다. softmax가 없으면 `torch.max(outputs, 1)`로 예측 클래스를 구할 수 없다", en: "Yes. Without softmax, `torch.max(outputs, 1)` can't find the predicted class" },
          why: {
            ko: "softmax는 순서를 바꾸지 않는 단조 함수라서, logits의 최댓값 위치와 확률의 최댓값 위치가 같습니다. 확률 값 자체가 필요할 때만 추론 단계에서 따로 softmax를 적용하세요.",
            en: "softmax is monotonic, so the position of the maximum is the same for logits and probabilities. Apply softmax separately at inference time only when you need actual probabilities."
          }
        }
      ],
      explain: {
        ko: "분류 모델의 출력 = **logits** (클래스별 점수, 범위 제한 없음).\n- 학습: `nn.CrossEntropyLoss()(logits, labels)` (softmax 넣지 않기)\n- 예측: `logits.argmax(1)` (softmax 불필요)\n- 확률이 필요할 때: `F.softmax(logits, dim=1)`\n\n`log_softmax`를 한 번에 계산하는 쪽이 수치적으로도 더 안정적이에요.",
        en: "A classifier's output = **logits** (unbounded per-class scores).\n- Training: `nn.CrossEntropyLoss()(logits, labels)` (no softmax)\n- Prediction: `logits.argmax(1)` (no softmax needed)\n- Probabilities: `F.softmax(logits, dim=1)`\n\nComputing `log_softmax` in one step is also more numerically stable."
      },
      tryit: `
logits = torch.tensor([[2.0, 0.5, -1.0]])
target = torch.tensor([0])
ce = nn.CrossEntropyLoss()
print(ce(logits, target))                    # tensor(0.2413)  correct
print(ce(F.softmax(logits, dim=1), target))  # tensor(0.7017)  softmax applied twice
`
    },
    {
      id: "c8", tag: "tutorial",
      topic: { ko: "학습 루프의 순서", en: "Order of the training loop" },
      q: {
        ko: "미니배치 하나에 대한 학습 단계로 올바른 것은?",
        en: "Which is the correct training step for one mini-batch?"
      },
      options: [
        {
          ok: true,
          c: `
optimizer.zero_grad()
outputs = net(inputs)
loss = criterion(outputs, labels)
loss.backward()
optimizer.step()
`,
          why: {
            ko: "기울기 비우기 → 순전파 → 손실 계산 → 역전파(기울기 계산) → 갱신. 튜토리얼과 같은 순서예요.",
            en: "Zero gradients → forward → loss → backward (compute gradients) → update. Exactly the tutorial's order."
          }
        },
        {
          c: `
outputs = net(inputs)
loss = criterion(outputs, labels)
optimizer.step()
loss.backward()
`,
          why: {
            ko: "`step()`이 `backward()`보다 먼저 와서, 이번 배치가 아니라 이전 배치의 기울기(또는 `None`)로 갱신합니다. 게다가 `zero_grad()`가 없어 기울기가 계속 누적돼요.",
            en: "`step()` runs before `backward()`, so it updates with the previous batch's gradients (or `None`), not this batch's. And without `zero_grad()`, gradients keep accumulating."
          }
        },
        {
          c: `
outputs = net(inputs)
loss = criterion(outputs, labels)
loss.backward()
optimizer.zero_grad()
optimizer.step()
`,
          why: {
            ko: "`backward()`로 계산한 기울기를 `step()` 직전에 지워 버려서 아무것도 학습되지 않습니다.",
            en: "The gradients from `backward()` are wiped right before `step()`, so nothing is learned."
          }
        },
        {
          c: `
outputs = net(inputs)
loss = criterion(outputs, labels)
loss.backward()
optimizer.step()
`,
          why: {
            ko: "`zero_grad()`가 없어서 배치마다 기울기가 계속 더해집니다(누적). 첫 배치에서는 괜찮아 보여도 갈수록 엉뚱한 방향으로 갱신돼요.",
            en: "Without `zero_grad()`, every batch's gradients keep adding up. It looks fine on the first batch, but updates drift in the wrong direction over time."
          }
        }
      ],
      explain: {
        ko: "외워 둘 5단계: **zero_grad → forward → loss → backward → step**.\n\n`zero_grad()`는 `backward()`보다 앞에만 있으면 되므로 `step()` 직후에 둬도 괜찮습니다. 핵심은 '이번 배치의 기울기만으로 갱신한다'는 점이에요.",
        en: "Five steps to memorize: **zero_grad → forward → loss → backward → step**.\n\n`zero_grad()` just has to come before `backward()`, so placing it right after `step()` also works. The point is to update using only the current batch's gradients."
      }
    },
    {
      id: "c9", tag: "beyond",
      topic: { ko: "에포크 · 배치 · 이터레이션", en: "Epochs, batches and iterations" },
      q: {
        ko: "학습 데이터 50,000장, `batch_size=4`, 2 에포크로 학습하면 `optimizer.step()`은 총 몇 번 호출될까요?",
        en: "With 50,000 training images, `batch_size=4` and 2 epochs, how many times is `optimizer.step()` called in total?"
      },
      options: [
        {
          ok: true,
          t: { ko: "25,000번", en: "25,000 times" },
          why: {
            ko: "1 에포크 = 데이터 전체를 한 바퀴 = 50,000 / 4 = 12,500 미니배치(iteration). 2 에포크면 25,000번입니다. 튜토리얼 로그가 `[2, 12000]`까지 찍히는 이유예요.",
            en: "1 epoch = one pass over the data = 50,000 / 4 = 12,500 mini-batches (iterations). Two epochs make 25,000. That's why the tutorial's log goes up to `[2, 12000]`."
          }
        },
        {
          t: { ko: "2번", en: "2 times" },
          why: {
            ko: "에포크마다 한 번이 아니라 미니배치마다 한 번 갱신합니다.",
            en: "Updates happen once per mini-batch, not once per epoch."
          }
        },
        {
          t: { ko: "12,500번", en: "12,500 times" },
          why: {
            ko: "1 에포크 분량입니다. 2 에포크를 돌았어요.",
            en: "That's only one epoch's worth. The loop runs 2 epochs."
          }
        },
        {
          t: { ko: "100,000번", en: "100,000 times" },
          why: {
            ko: "이미지 한 장마다가 아니라 4장 묶음(배치)마다 한 번 갱신합니다. 50,000 × 2 = 100,000은 이미지를 본 총 횟수예요.",
            en: "Updates happen once per batch of 4, not per image. 50,000 × 2 = 100,000 is the total number of images seen."
          }
        }
      ],
      explain: {
        ko: "용어 정리:\n- **batch (미니배치)**: 한 번에 모델에 넣는 샘플 묶음 (여기선 4장)\n- **iteration (step)**: 배치 하나로 한 번 갱신하는 것\n- **epoch**: 학습 데이터 전체를 한 바퀴 도는 것\n\n튜토리얼은 2,000 미니배치마다 `running_loss / 2000`(평균 손실)을 출력하고 0으로 초기화해요. 배치가 작을수록 갱신은 잦지만 기울기는 더 noisy해집니다.",
        en: "Terminology:\n- **batch (mini-batch)**: the group of samples fed at once (4 images here)\n- **iteration (step)**: one update from one batch\n- **epoch**: one full pass over the training data\n\nThe tutorial prints `running_loss / 2000` (the average loss) every 2,000 mini-batches, then resets it. Smaller batches mean more frequent but noisier updates."
      }
    },
    {
      id: "c10", tag: "beyond",
      topic: { ko: "모델 저장과 weights_only", en: "Saving models and weights_only" },
      q: {
        ko: "튜토리얼은 `torch.save(net.state_dict(), PATH)`로 저장하고 `net.load_state_dict(torch.load(PATH, weights_only=True))`로 불러옵니다. `weights_only=True`의 의미로 옳은 것은?",
        en: "The tutorial saves with `torch.save(net.state_dict(), PATH)` and loads with `net.load_state_dict(torch.load(PATH, weights_only=True))`. What does `weights_only=True` do?"
      },
      options: [
        {
          ok: true,
          t: { ko: "pickle이 임의 코드를 실행하지 못하도록 텐서 같은 안전한 데이터만 복원한다", en: "It only restores safe data like tensors, so pickle can't run arbitrary code" },
          why: {
            ko: "출처를 모르는 `.pt` 파일을 그냥 불러오면 악성 코드가 실행될 수 있습니다. PyTorch 2.6부터는 이 값이 기본으로 `True`예요.",
            en: "Loading a `.pt` file from an unknown source could otherwise run malicious code. Since PyTorch 2.6, this defaults to `True`."
          }
        },
        {
          t: { ko: "이름 그대로 편향(bias) 같은 다른 값은 빼고 가중치(weight) 텐서만 불러온다", en: "As the name says, it loads only weight tensors and skips biases and other values" },
          why: {
            ko: "state_dict의 모든 텐서(weight, bias 등)를 불러옵니다. 여기서 'weights'는 '학습된 값 전반'을 뜻해요.",
            en: "It loads every tensor in the state_dict (weights, biases, …). 'weights' here means 'learned values' in general."
          }
        },
        {
          t: { ko: "모델 클래스 정의가 없어도 가중치로부터 모델 구조까지 통째로 복원해 준다", en: "It rebuilds the whole model, structure included, without needing the class definition" },
          why: {
            ko: "반대입니다. state_dict는 '파라미터 이름 → 텐서' 사전일 뿐이라, `net = Net()`처럼 클래스로 모델을 먼저 만든 뒤 값을 채워 넣어야 해요.",
            en: "The opposite. A state_dict is just a 'parameter name → tensor' dictionary, so you must first build the model from its class (`net = Net()`) and then load the values into it."
          }
        },
        {
          t: { ko: "불러올 때 가중치를 압축된 형태로 유지해 메모리 사용량을 줄여 준다", en: "It keeps the weights compressed while loading to reduce memory usage" },
          why: {
            ko: "압축이나 메모리와는 관계없는, 안전을 위한 로딩 옵션입니다.",
            en: "It's a safety option for loading, unrelated to compression or memory."
          }
        }
      ],
      explain: {
        ko: "**state_dict** = `{'conv1.weight': tensor, 'conv1.bias': tensor, ...}` 형태의 OrderedDict.\n- 저장: `torch.save(net.state_dict(), PATH)` (권장 방식)\n- 불러오기: `net = Net()` → `net.load_state_dict(torch.load(PATH, weights_only=True))`\n\n모델 객체 전체를 pickle로 저장하는 방식보다 코드 변경에 강하고 안전해서 공식적으로 권장됩니다. 다른 device로 불러올 때는 `map_location`을 쓰세요.",
        en: "A **state_dict** is an OrderedDict like `{'conv1.weight': tensor, 'conv1.bias': tensor, ...}`.\n- Save: `torch.save(net.state_dict(), PATH)` (recommended)\n- Load: `net = Net()` → `net.load_state_dict(torch.load(PATH, weights_only=True))`\n\nThis is officially recommended over pickling the whole model object: it's safer and survives code changes better. Use `map_location` to load onto a different device."
      },
      tryit: `
for name, tensor in net.state_dict().items():
    print(name, tuple(tensor.shape))
# conv1.weight (6, 3, 5, 5)
# conv1.bias (6,)
# ...
`
    },
    {
      id: "c11", tag: "tutorial",
      topic: { ko: "예측 클래스 구하기", en: "Getting predicted classes" },
      q: {
        ko: "다음 코드에서 `predicted`의 값은?",
        en: "What is `predicted`?"
      },
      code: `
outputs = torch.tensor([[0.1, 2.0, -1.0],
                        [3.0, 0.5,  0.2]])
_, predicted = torch.max(outputs, 1)
print(predicted)
`,
      options: [
        {
          ok: true,
          t: "`tensor([1, 0])`",
          why: {
            ko: "`torch.max(x, dim)`은 (최댓값, 그 위치)를 돌려줍니다. dim=1(각 행 = 각 이미지)에서 최댓값의 위치는 각각 1번(2.0), 0번(3.0) 클래스예요. `_`로 값은 버리고 위치만 받았습니다.",
            en: "`torch.max(x, dim)` returns (max values, their indices). Along dim=1 (each row = one image), the maxima are at class 1 (2.0) and class 0 (3.0). `_` discards the values and keeps the indices."
          }
        },
        {
          t: "`tensor([2., 3.])`",
          why: {
            ko: "첫 번째 반환값인 최댓값(values)입니다. 예측 클래스는 두 번째 반환값(indices)이에요.",
            en: "Those are the first return value, the max values. The predicted classes are the second return value, the indices."
          }
        },
        {
          t: "`tensor([1, 0, 1])`",
          why: {
            ko: "dim=0(열 방향)으로 구한 결과입니다. '클래스마다 어느 이미지의 점수가 가장 높은가'를 묻는 셈이라 의미가 달라요.",
            en: "That's along dim=0 (columns): 'which image scores highest for each class?', a different question entirely."
          }
        },
        {
          t: "`tensor(3.)`",
          why: {
            ko: "dim을 주지 않은 `torch.max(outputs)`의 결과(전체 최댓값)입니다.",
            en: "That's `torch.max(outputs)` without a dim: the overall maximum."
          }
        }
      ],
      explain: {
        ko: "`torch.max(outputs, 1)`의 indices는 `outputs.argmax(dim=1)`과 같습니다. 정확도는 배치마다 `(predicted == labels).sum().item()`을 더한 뒤 전체 개수로 나눠서 구해요.\n\n튜토리얼의 결과는 약 55%로, 10개 클래스를 무작위로 찍을 때의 10%보다 훨씬 높으니 모델이 무언가를 배웠다는 뜻입니다. 다만 클래스별로 보면 새(bird)처럼 어려운 클래스는 정확도가 30%대에 그쳐요.",
        en: "The indices from `torch.max(outputs, 1)` equal `outputs.argmax(dim=1)`. Accuracy = the sum of `(predicted == labels).sum().item()` over all batches, divided by the total count.\n\nThe tutorial reaches about 55%, far above the 10% of random guessing among 10 classes, so the model learned something. Per class, though, hard ones like bird stay in the 30% range."
      },
      tryit: `
outputs = torch.tensor([[0.1, 2.0, -1.0], [3.0, 0.5, 0.2]])
labels = torch.tensor([1, 2])
predicted = outputs.argmax(dim=1)
print(predicted, (predicted == labels).sum().item())   # tensor([1, 0]) 1
`
    },
    {
      id: "c12", tag: "tutorial",
      topic: { ko: "GPU(MPS)에서 학습하기", en: "Training on a GPU (MPS)" },
      q: {
        ko: "Mac(MPS)에서 학습하려고 `net.to(device)`만 하고, 학습 루프의 `inputs`, `labels`는 옮기지 않았습니다. 어떻게 될까요?",
        en: "To train on a Mac (MPS), you call `net.to(device)` but forget to move `inputs` and `labels` in the training loop. What happens?"
      },
      options: [
        {
          ok: true,
          t: { ko: "에러가 난다: 입력(CPU)과 가중치(MPS)의 device가 다르다", en: "An error: input and weights are on different devices" },
          why: {
            ko: "실제 메시지 예: `input(device='cpu') and weight(device=mps:0') must be on the same device`. 튜토리얼처럼 매 스텝 `inputs, labels = data[0].to(device), data[1].to(device)`로 옮겨야 해요.",
            en: "Example message: `input(device='cpu') and weight(device=mps:0') must be on the same device`. As in the tutorial, move them every step: `inputs, labels = data[0].to(device), data[1].to(device)`."
          }
        },
        {
          t: { ko: "PyTorch가 입력을 자동으로 MPS로 옮겨서 정상적으로 학습된다", en: "PyTorch moves the inputs to MPS automatically and training works" },
          why: {
            ko: "PyTorch는 device 간 이동을 몰래 해 주지 않습니다. 비싼 데이터 복사가 숨겨지지 않도록 일부러 명시적으로 하게 만든 거예요.",
            en: "PyTorch never moves data between devices implicitly. It's deliberately explicit so that expensive copies aren't hidden."
          }
        },
        {
          t: { ko: "모델은 MPS에 있어도, 입력이 CPU에 있으니 조용히 CPU에서 학습된다", en: "Since the inputs are on the CPU, it silently trains on the CPU instead" },
          why: {
            ko: "모델의 가중치가 이미 MPS에 있으므로 CPU에서 계산할 수 없고, 에러가 납니다.",
            en: "The model's weights are already on MPS, so the computation can't run on the CPU, and you get an error."
          }
        },
        {
          t: { ko: "정상 동작하지만 매 스텝 device 간 복사가 일어나 조금 느려진다", en: "It works, just slower because data is copied between devices every step" },
          why: {
            ko: "속도 문제가 아니라 아예 실행이 안 됩니다. 연산에 참여하는 텐서는 모두 같은 device에 있어야 해요.",
            en: "It's not a speed issue; it doesn't run at all. Every tensor in an operation must be on the same device."
          }
        }
      ],
      explain: {
        ko: "규칙: **한 연산에 참여하는 모든 텐서는 같은 device에 있어야 한다.**\n- 모델: `net.to(device)` 한 번 (Module은 자기 자신을 이동)\n- 데이터: 배치마다 `x = x.to(device)` (Tensor는 새 텐서를 반환)\n\n튜토리얼은 `torch.accelerator.current_accelerator()`로 device를 고릅니다. 또 이 네트워크는 매우 작아서 GPU로 옮겨도 속도가 크게 빨라지지 않는다고 말해요. GPU는 계산량이 클수록 이득입니다.",
        en: "Rule: **every tensor in one operation must be on the same device.**\n- Model: `net.to(device)` once (a Module moves itself)\n- Data: `x = x.to(device)` for every batch (a Tensor returns a new tensor)\n\nThe tutorial picks the device with `torch.accelerator.current_accelerator()`. It also notes that this network is so small that moving to a GPU gives no massive speedup. GPUs pay off as the amount of computation grows."
      },
      tryit: `
device = torch.device(torch.accelerator.current_accelerator().type
                      if torch.accelerator.is_available() else 'cpu')
net.to(device)
for data in trainloader:
    inputs, labels = data[0].to(device), data[1].to(device)
    ...
`
    }
  ]
});
