// Quiz questions for "Neural Networks".
// Loaded by quiz.html in this folder and by ../main.html (quiz home + mixed practice).
//
// Format: each question has an id (unique across all chapters), tag "tutorial" | "beyond",
// bilingual { ko, en } text, and 4 options with exactly one `ok: true`. Every option has a `why`.
// Optional: `code` (shown under the question), `tryit` (runnable snippet shown after answering).
// Text supports `inline code`, **bold**, "- " bullet lines, and blank-line paragraphs.
(window.QUIZ_CHAPTERS = window.QUIZ_CHAPTERS || []).push({
  id: "neural-networks",
  dir: "4",
  title: { ko: "신경망 (Neural Networks)", en: "Neural Networks" },
  summary: { ko: "nn.Module 구조, 합성곱 출력 크기, 파라미터, 손실 함수, 역전파와 가중치 갱신", en: "nn.Module structure, conv output sizes, parameters, loss functions, backprop & weight updates" },
  source: "https://docs.pytorch.org/tutorials/beginner/blitz/neural_networks_tutorial.html",
  questions: [
    {
      id: "n1", tag: "tutorial",
      topic: { ko: "nn.Module의 구조", en: "Structure of an nn.Module" },
      q: {
        ko: "`nn.Module`을 상속해 신경망을 만들 때 옳은 설명은?",
        en: "Which statement about building a network by subclassing `nn.Module` is correct?"
      },
      options: [
        {
          ok: true,
          t: { ko: "`forward`만 정의하면 `backward`는 autograd가 만들어 준다", en: "Define only `forward`; autograd builds `backward`" },
          why: {
            ko: "`forward`에서 쓴 텐서 연산이 그래프로 기록되므로 역전파는 자동입니다. `forward` 안에서는 어떤 텐서 연산이든 쓸 수 있어요.",
            en: "The tensor operations in `forward` are recorded in the graph, so backprop comes for free. You can use any tensor operation inside `forward`."
          }
        },
        {
          t: { ko: "`forward`와 `backward`를 모두 직접 구현해야 한다", en: "You must implement both `forward` and `backward`" },
          why: {
            ko: "`backward`를 직접 짜는 건 `torch.autograd.Function`으로 특수한 연산을 새로 만들 때뿐입니다.",
            en: "You only write `backward` yourself when creating a custom operation with `torch.autograd.Function`."
          }
        },
        {
          t: { ko: "속도를 위해 `net(x)` 대신 `net.forward(x)`를 직접 호출하는 것이 권장된다", en: "For speed, call `net.forward(x)` directly instead of `net(x)`" },
          why: {
            ko: "`net(x)`는 `__call__`을 거쳐 hook 같은 필요한 처리를 한 뒤 `forward`를 호출합니다. `forward`를 직접 부르면 이런 처리를 건너뛰므로 항상 `net(x)`를 쓰세요.",
            en: "`net(x)` goes through `__call__`, which runs hooks and other bookkeeping before calling `forward`. Calling `forward` directly skips all that, so always use `net(x)`."
          }
        },
        {
          t: { ko: "레이어(`nn.Conv2d` 등)는 `forward` 안에서 만들어야 한다", en: "Layers (`nn.Conv2d`, …) should be created inside `forward`" },
          why: {
            ko: "`forward`에서 만들면 호출할 때마다 새 무작위 가중치가 생기고 파라미터로 등록되지도 않아 학습이 안 됩니다. 레이어는 `__init__`에서 `self.conv1 = ...`처럼 만드세요.",
            en: "Created in `forward`, they'd get fresh random weights on every call and never be registered as parameters, so nothing would learn. Create layers in `__init__`, e.g. `self.conv1 = ...`."
          }
        }
      ],
      explain: {
        ko: "nn.Module의 기본 구조:\n- `__init__`: 학습할 파라미터를 가진 레이어 정의 (`super().__init__()`을 먼저!)\n- `forward(input)`: 데이터가 흐르는 계산을 정의하고 출력을 반환\n\n활성화 함수나 풀링처럼 파라미터가 없는 연산은 `forward`에서 `F.relu`, `F.max_pool2d`처럼 함수로 써도 됩니다.",
        en: "The basic structure of an nn.Module:\n- `__init__`: define layers with learnable parameters (call `super().__init__()` first!)\n- `forward(input)`: define how data flows and return the output\n\nParameter-free operations such as activations and pooling can be written as functions in `forward`, like `F.relu` and `F.max_pool2d`."
      }
    },
    {
      id: "n2", tag: "tutorial",
      topic: { ko: "입력 크기와 출력 크기 공식", en: "Input size and the output-size formula" },
      q: {
        ko: "튜토리얼은 'MNIST에 쓰려면 이미지를 32×32로 리사이즈하라'고 합니다. 28×28 MNIST 이미지 `torch.randn(1, 1, 28, 28)`을 그대로 넣으면 어떻게 될까요?",
        en: "The tutorial says to resize MNIST images to 32×32. What happens if you feed a 28×28 MNIST image, `torch.randn(1, 1, 28, 28)`, as is?"
      },
      code: `
self.conv1 = nn.Conv2d(1, 6, 5)
self.conv2 = nn.Conv2d(6, 16, 5)
self.fc1 = nn.Linear(16 * 5 * 5, 120)
# forward: conv1 -> relu -> max_pool2d(2)
#       -> conv2 -> relu -> max_pool2d(2) -> flatten -> fc1 -> ...
`,
      options: [
        {
          ok: true,
          t: { ko: "`fc1`에서 shape 에러가 난다 (펼친 특징 수가 400이 아닌 256)", en: "A shape error at `fc1` (256 flattened features instead of 400)" },
          why: {
            ko: "28 → conv → 24 → pool → 12 → conv → 8 → pool → 4. 16×4×4 = 256인데 `fc1`은 400을 기대하므로 `mat1 and mat2 shapes cannot be multiplied (1x256 and 400x120)` 에러가 납니다.",
            en: "28 → conv → 24 → pool → 12 → conv → 8 → pool → 4. 16×4×4 = 256, but `fc1` expects 400: `mat1 and mat2 shapes cannot be multiplied (1x256 and 400x120)`."
          }
        },
        {
          t: { ko: "`conv1`에서 에러가 난다. Conv2d는 32×32 입력만 받기 때문", en: "An error at `conv1`, because Conv2d only accepts 32×32 inputs" },
          why: {
            ko: "합성곱 층은 커널보다 크기만 하면 어떤 크기의 이미지도 받습니다. 고정된 입력 크기를 요구하는 건 `nn.Linear`예요.",
            en: "A conv layer accepts any image at least as large as its kernel. It's `nn.Linear` that requires a fixed input size."
          }
        },
        {
          t: { ko: "정상 동작한다. PyTorch가 크기를 자동으로 맞춰 주기 때문", en: "It works, because PyTorch resizes automatically" },
          why: {
            ko: "자동 리사이즈는 없습니다. 리사이즈는 `v2.Resize(32)` 같은 transform으로 직접 해야 해요.",
            en: "There's no automatic resizing. You must resize yourself with a transform such as `v2.Resize(32)`."
          }
        },
        {
          t: { ko: "정상 동작하지만 출력이 (1, 10) 대신 (1, 8)이 된다", en: "It works, but the output is (1, 8) instead of (1, 10)" },
          why: {
            ko: "출력 크기는 `fc3 = nn.Linear(84, 10)`이 정하므로 입력 크기와 상관없이 10입니다. 게다가 그 전에 `fc1`에서 에러가 나요.",
            en: "The output size is fixed at 10 by `fc3 = nn.Linear(84, 10)`, whatever the input size. Besides, it errors at `fc1` first."
          }
        }
      ],
      explain: {
        ko: "**합성곱 출력 크기 공식**: ⌊(W + 2P − K) / S⌋ + 1 (W 입력 크기, K 커널, P 패딩, S 스트라이드)\n- `Conv2d(·, ·, 5)` (P=0, S=1): W − 4\n- `max_pool2d(2)`: W ÷ 2\n\n예: `Conv2d(3, 8, kernel_size=3, stride=2, padding=1)`에 64×64를 넣으면 ⌊(64 + 2 − 3) / 2⌋ + 1 = 32.\n\nconv와 pool은 입력 크기에 유연하지만, 그 뒤의 `nn.Linear`는 입력 특징 수가 고정이라 해상도가 바뀌면 깨집니다.",
        en: "**Conv output-size formula**: ⌊(W + 2P − K) / S⌋ + 1 (W input size, K kernel, P padding, S stride)\n- `Conv2d(·, ·, 5)` (P=0, S=1): W − 4\n- `max_pool2d(2)`: W ÷ 2\n\nE.g. `Conv2d(3, 8, kernel_size=3, stride=2, padding=1)` on 64×64 gives ⌊(64 + 2 − 3) / 2⌋ + 1 = 32.\n\nConv and pooling layers adapt to any input size, but the `nn.Linear` after them has a fixed input size, so changing the resolution breaks it."
      },
      tryit: `
net = Net()
print(net(torch.randn(1, 1, 32, 32)).shape)   # torch.Size([1, 10])
try:
    net(torch.randn(1, 1, 28, 28))
except RuntimeError as e:
    print(e)   # mat1 and mat2 shapes cannot be multiplied (1x256 and 400x120)
`
    },
    {
      id: "n3", tag: "tutorial",
      topic: { ko: "net.parameters()", en: "net.parameters()" },
      q: {
        ko: "튜토리얼의 Net에서 `len(params)`가 10인 이유는?",
        en: "Why is `len(params)` 10 for the tutorial's Net?"
      },
      code: `
params = list(net.parameters())
print(len(params))        # 10
print(params[0].size())   # torch.Size([6, 1, 5, 5])
`,
      options: [
        {
          ok: true,
          t: { ko: "학습 가능한 층 5개에 weight·bias 텐서가 하나씩 있기 때문", en: "5 learnable layers each hold one weight and one bias tensor" },
          why: {
            ko: "`parameters()`는 숫자 하나하나가 아니라 **파라미터 텐서**를 하나씩 돌려줍니다. conv1, conv2, fc1, fc2, fc3의 5개 층 × (weight, bias) = 10. ReLU와 max pooling에는 파라미터가 없어요.",
            en: "`parameters()` yields **parameter tensors**, not individual numbers. conv1, conv2, fc1, fc2, fc3: 5 layers × (weight, bias) = 10. ReLU and max pooling have no parameters."
          }
        },
        {
          t: { ko: "마지막 층 `fc3`의 출력 클래스가 10개이기 때문", en: "Because the last layer, `fc3`, outputs 10 classes" },
          why: {
            ko: "우연히 같은 숫자일 뿐입니다. 클래스 수는 `fc3`의 출력 크기예요.",
            en: "That's a coincidence. The class count is `fc3`'s output size."
          }
        },
        {
          t: { ko: "ReLU와 pooling을 포함해 네트워크가 총 10개 층이기 때문", en: "Because the network has 10 layers, counting ReLU and pooling" },
          why: {
            ko: "ReLU, max pooling, flatten은 학습할 파라미터가 없어서 `parameters()`에 나타나지 않습니다.",
            en: "ReLU, max pooling and flatten have no learnable parameters, so they don't appear in `parameters()`."
          }
        },
        {
          t: { ko: "네트워크 전체에서 학습할 가중치 값(스칼라)이 모두 10개이기 때문", en: "Because the whole network has 10 learnable weight values (scalars)" },
          why: {
            ko: "conv1의 weight만 해도 6×1×5×5 = 150개의 값이 있습니다. 10은 텐서의 개수예요.",
            en: "conv1's weight alone holds 6×1×5×5 = 150 values. 10 is the number of tensors."
          }
        }
      ],
      explain: {
        ko: "`params[0].size()` = `[6, 1, 5, 5]` = (출력 채널, 입력 채널, 커널 높이, 커널 너비). 즉 conv1은 1채널 입력을 받아 5×5 필터 6개를 학습해요.\n\n`net.named_parameters()`를 쓰면 `conv1.weight`, `conv1.bias`처럼 이름도 함께 볼 수 있습니다.",
        en: "`params[0].size()` = `[6, 1, 5, 5]` = (out channels, in channels, kernel height, kernel width). So conv1 learns six 5×5 filters over a 1-channel input.\n\n`net.named_parameters()` shows the names too, like `conv1.weight` and `conv1.bias`."
      },
      tryit: `
for name, p in net.named_parameters():
    print(name, tuple(p.shape))
# conv1.weight (6, 1, 5, 5)
# conv1.bias (6,)
# conv2.weight (16, 6, 5, 5)
# ...
`
    },
    {
      id: "n4", tag: "beyond",
      topic: { ko: "파라미터 개수 세기", en: "Counting parameters" },
      q: {
        ko: "`nn.Conv2d(1, 6, 5)`의 학습 가능한 값(스칼라)은 모두 몇 개일까요?",
        en: "How many learnable values (scalars) does `nn.Conv2d(1, 6, 5)` have?"
      },
      options: [
        {
          ok: true,
          t: "156",
          why: {
            ko: "weight: 6 × 1 × 5 × 5 = 150, bias: 출력 채널마다 1개씩 6개 → 합계 156.",
            en: "weight: 6 × 1 × 5 × 5 = 150, bias: one per output channel = 6 → 156 in total."
          }
        },
        {
          t: "150",
          why: {
            ko: "bias 6개를 빠뜨렸습니다.",
            en: "This forgets the 6 biases."
          }
        },
        {
          t: "30",
          why: {
            ko: "6 × 5는 커널의 한 변만 곱한 값입니다. 커널은 5×5 면적이에요.",
            en: "6 × 5 uses only one side of the kernel. The kernel covers a 5×5 area."
          }
        },
        {
          t: "4,704",
          why: {
            ko: "6 × 28 × 28 = 4,704는 출력 feature map의 값 개수입니다. 합성곱은 같은 필터를 모든 위치에서 **공유**하므로 파라미터 수는 이미지 크기와 무관해요.",
            en: "6 × 28 × 28 = 4,704 is the number of values in the output feature map. Convolution **shares** each filter across all positions, so the parameter count doesn't depend on image size."
          }
        }
      ],
      explain: {
        ko: "- `Conv2d(C_in, C_out, K)`: C_out × C_in × K × K + C_out\n- `Linear(in, out)`: in × out + out\n\n튜토리얼 Net의 `fc1 = Linear(400, 120)`은 48,120개로, conv1(156개)의 300배가 넘습니다. 가중치 공유 덕분에 합성곱 층이 훨씬 효율적이라는 뜻이에요. 전체 개수는 `sum(p.numel() for p in net.parameters())`로 구할 수 있습니다 (이 Net은 61,706개).",
        en: "- `Conv2d(C_in, C_out, K)`: C_out × C_in × K × K + C_out\n- `Linear(in, out)`: in × out + out\n\nIn the tutorial's Net, `fc1 = Linear(400, 120)` has 48,120, over 300× more than conv1's 156. Thanks to weight sharing, conv layers are far more parameter-efficient. Get the total with `sum(p.numel() for p in net.parameters())` (61,706 for this Net)."
      },
      tryit: `
conv1 = nn.Conv2d(1, 6, 5)
print(sum(p.numel() for p in conv1.parameters()))   # 156
print(sum(p.numel() for p in net.parameters()))     # 61706
`
    },
    {
      id: "n5", tag: "tutorial",
      topic: { ko: "미니배치와 unsqueeze", en: "Mini-batches and unsqueeze" },
      q: {
        ko: "튜토리얼에 따르면 `torch.nn`은 미니배치 입력을 전제로 합니다. 이미지 한 장 `img`(shape `(1, 32, 32)`)를 이 Net에 넣으려면?",
        en: "According to the tutorial, `torch.nn` expects mini-batches. How do you feed a single image `img` (shape `(1, 32, 32)`) into this Net?"
      },
      options: [
        {
          ok: true,
          t: "`img.unsqueeze(0)` → `(1, 1, 32, 32)`",
          why: {
            ko: "0번 위치에 크기 1인 '가짜 배치 차원'을 추가해 `(N, C, H, W)` 형태를 만듭니다.",
            en: "It inserts a fake batch dimension of size 1 at position 0, producing the `(N, C, H, W)` layout."
          }
        },
        {
          t: "`img.squeeze()` → `(32, 32)`",
          why: {
            ko: "오히려 크기 1인 차원을 없애서 채널 차원까지 사라집니다.",
            en: "This removes size-1 dimensions instead, so even the channel dimension disappears."
          }
        },
        {
          t: "`img.view(-1)` → `(1024,)`",
          why: {
            ko: "모든 차원을 1차원으로 펴 버려서 이미지 구조가 사라집니다. conv 층에 넣을 수 없어요.",
            en: "It flattens everything to 1-D, destroying the image structure. A conv layer can't take it."
          }
        },
        {
          t: "`img.unsqueeze(-1)` → `(1, 32, 32, 1)`",
          why: {
            ko: "맨 뒤에 차원을 추가하면 PyTorch는 이를 채널 32개, 높이 32, 너비 1로 해석합니다. 차원 순서가 틀렸어요.",
            en: "Adding the dim at the end makes PyTorch read it as 32 channels, height 32, width 1. The dimension order is wrong."
          }
        }
      ],
      explain: {
        ko: "`nn.Conv2d`의 표준 입력은 4D `(nSamples, nChannels, Height, Width)`입니다.\n\n심화: 최신 PyTorch의 `nn.Conv2d`는 배치 없는 3D 입력 `(C, H, W)`도 받습니다. 하지만 이 Net의 `torch.flatten(x, 1)`은 0번 차원을 배치로 가정하므로, `(1, 32, 32)`를 그대로 넣으면 `fc1`에서 `(16x25 and 400x120)` 에러가 나요. '첫 번째 차원은 배치'라는 규칙을 지키는 게 안전합니다.",
        en: "The standard input for `nn.Conv2d` is 4-D: `(nSamples, nChannels, Height, Width)`.\n\nBonus: modern `nn.Conv2d` also accepts unbatched 3-D input `(C, H, W)`. But this Net's `torch.flatten(x, 1)` assumes dim 0 is the batch, so passing `(1, 32, 32)` directly fails at `fc1` with `(16x25 and 400x120)`. Sticking to 'the first dim is the batch' is the safe rule."
      },
      tryit: `
img = torch.randn(1, 32, 32)
print(img.unsqueeze(0).shape)       # torch.Size([1, 1, 32, 32])
print(net(img.unsqueeze(0)).shape)  # torch.Size([1, 10])
`
    },
    {
      id: "n6", tag: "tutorial",
      topic: { ko: "nn.Parameter 자동 등록", en: "Automatic registration with nn.Parameter" },
      q: {
        ko: "다음 코드의 출력은?",
        en: "What does this code print?"
      },
      code: `
class M(nn.Module):
    def __init__(self):
        super().__init__()
        self.a = nn.Parameter(torch.randn(3))
        self.b = torch.randn(3, requires_grad=True)
        self.lin = nn.Linear(2, 2)

print([name for name, _ in M().named_parameters()])
`,
      options: [
        {
          ok: true,
          t: "`['a', 'lin.weight', 'lin.bias']`",
          why: {
            ko: "`nn.Parameter`나 하위 모듈(`nn.Linear`)을 속성으로 할당하면 자동으로 등록됩니다. 일반 텐서 `b`는 `requires_grad=True`여도 등록되지 않아요.",
            en: "Assigning an `nn.Parameter` or a submodule (`nn.Linear`) as an attribute registers it automatically. The plain tensor `b` is not registered, even with `requires_grad=True`."
          }
        },
        {
          t: "`['a', 'b', 'lin.weight', 'lin.bias']`",
          why: {
            ko: "`b`는 일반 텐서라 등록되지 않습니다. `requires_grad`와 '파라미터로 등록'은 별개예요.",
            en: "`b` is a plain tensor, so it isn't registered. `requires_grad` and parameter registration are separate things."
          }
        },
        {
          t: "`['a', 'b', 'lin']`",
          why: {
            ko: "하위 모듈은 모듈 이름이 아니라 그 안의 파라미터(`lin.weight`, `lin.bias`)로 나타나고, `b`는 등록되지 않습니다.",
            en: "A submodule shows up as its parameters (`lin.weight`, `lin.bias`), not its name, and `b` isn't registered."
          }
        },
        {
          t: "`['lin.weight', 'lin.bias']`",
          why: {
            ko: "`nn.Parameter`로 감싼 `a`도 자동으로 등록됩니다.",
            en: "`a`, wrapped in `nn.Parameter`, is registered automatically too."
          }
        }
      ],
      explain: {
        ko: "튜토리얼 Recap: **nn.Parameter** = Module의 속성으로 할당하면 **자동으로 파라미터로 등록되는** 텐서.\n\n등록되지 않은 텐서는 `net.parameters()`에 없으므로 ① 옵티마이저가 갱신하지 않고 ② `state_dict()`로 저장되지 않으며 ③ `net.to(device)` 때 함께 이동하지 않습니다. 학습은 안 하지만 저장·이동은 필요한 텐서(예: BatchNorm의 running mean)는 `self.register_buffer()`를 써요.",
        en: "Tutorial recap: **nn.Parameter** = a tensor that is **automatically registered as a parameter** when assigned as a Module attribute.\n\nAn unregistered tensor isn't in `net.parameters()`, so it is (1) not updated by the optimizer, (2) not saved in `state_dict()`, and (3) not moved by `net.to(device)`. For tensors that aren't trained but must be saved and moved (e.g. BatchNorm's running mean), use `self.register_buffer()`."
      }
    },
    {
      id: "n7", tag: "beyond",
      topic: { ko: "활성화 함수가 필요한 이유", en: "Why activation functions matter" },
      q: {
        ko: "Net에서 모든 `F.relu`를 지우고 `fc1 → fc2 → fc3`을 Linear 층만으로 연결하면 어떤 문제가 생길까요?",
        en: "If you remove every `F.relu` from Net, so `fc1 → fc2 → fc3` are just stacked Linear layers, what goes wrong?"
      },
      options: [
        {
          ok: true,
          t: { ko: "선형 변환의 합성은 하나의 선형 변환이라, 층을 쌓아도 단층 선형 모델과 같아진다", en: "Linear maps compose into one, so it's no better than a single linear layer" },
          why: {
            ko: "W₃(W₂(W₁x + b₁) + b₂) + b₃ 는 W'x + b' 꼴로 정리됩니다. 비선형 활성화 함수가 있어야 층을 쌓는 의미가 생겨요.",
            en: "W₃(W₂(W₁x + b₁) + b₂) + b₃ simplifies to W'x + b'. Nonlinear activations are what make stacking layers worthwhile."
          }
        },
        {
          t: { ko: "활성화 함수가 없으면 역전파가 불가능해져 `backward()`에서 에러가 난다", en: "Without activations, backprop becomes impossible and `backward()` raises an error" },
          why: {
            ko: "선형 층만으로도 미분은 잘 됩니다. 문제는 학습이 되느냐가 아니라 표현력이에요.",
            en: "Linear layers differentiate just fine. The problem isn't whether it trains, it's expressiveness."
          }
        },
        {
          t: { ko: "ReLU의 파라미터가 사라져 메모리가 절약되는 장점만 있고 정확도는 그대로다", en: "Only an upside: ReLU's parameters disappear, saving memory with no accuracy cost" },
          why: {
            ko: "ReLU에는 파라미터가 없으므로 지워도 파라미터 수는 그대로입니다.",
            en: "ReLU has no parameters, so removing it doesn't change the parameter count at all."
          }
        },
        {
          t: { ko: "마지막 층의 출력이 항상 0 이상으로 제한되어 음수를 예측할 수 없다", en: "The last layer's outputs become restricted to ≥ 0, so negatives can't be predicted" },
          why: {
            ko: "그건 반대로 ReLU(max(0, x))를 **출력층**에 썼을 때 생기는 특징입니다. 그래서 튜토리얼도 마지막 `fc3`에는 ReLU를 쓰지 않아요.",
            en: "That's what happens when you *do* put ReLU (max(0, x)) on the **output layer**, which is why the tutorial leaves it off `fc3`."
          }
        }
      ],
      explain: {
        ko: "**활성화 함수**는 신경망에 비선형성을 주는 핵심 요소입니다. ReLU(x) = max(0, x)는 계산이 간단하고 기울기 소실 문제가 적어서 가장 널리 쓰여요.\n\n출력층에는 보통 활성화 함수를 넣지 않고, logits를 그대로 손실 함수에 넘깁니다.",
        en: "**Activation functions** give a network its nonlinearity. ReLU(x) = max(0, x) is the most popular: cheap to compute and less prone to vanishing gradients.\n\nThe output layer usually has no activation; its logits go straight to the loss function."
      },
      tryit: `
l1, l2 = nn.Linear(3, 4), nn.Linear(4, 2)
W = l2.weight @ l1.weight
b = l2.weight @ l1.bias + l2.bias
x = torch.randn(5, 3)
print(torch.allclose(l2(l1(x)), x @ W.T + b, atol=1e-6))   # True: one linear layer
`
    },
    {
      id: "n8", tag: "tutorial",
      topic: { ko: "손실 함수: MSELoss", en: "Loss function: MSELoss" },
      q: {
        ko: "다음 `loss`의 값은?",
        en: "What is the value of `loss`?"
      },
      code: `
output = torch.tensor([1., 2., 3.])
target = torch.tensor([1., 0., 0.])
loss = nn.MSELoss()(output, target)
`,
      options: [
        {
          ok: true,
          t: "≈ 4.333 (13 / 3)",
          why: {
            ko: "MSE = 평균((출력 − 정답)²) = (0² + 2² + 3²) / 3 = 13 / 3 ≈ 4.333.",
            en: "MSE = mean((output − target)²) = (0² + 2² + 3²) / 3 = 13 / 3 ≈ 4.333."
          }
        },
        {
          t: "13.0",
          why: {
            ko: "제곱합까지만 계산했습니다. MSELoss는 기본적으로 평균(`reduction='mean'`)을 냅니다. 합을 원하면 `reduction='sum'`을 쓰세요.",
            en: "That's just the sum of squares. MSELoss averages by default (`reduction='mean'`); use `reduction='sum'` for the sum."
          }
        },
        {
          t: "≈ 1.667 (5 / 3)",
          why: {
            ko: "절댓값 차이의 평균, 즉 L1 손실(`nn.L1Loss`)입니다.",
            en: "That's the mean absolute difference, i.e. the L1 loss (`nn.L1Loss`)."
          }
        },
        {
          t: "≈ 3.606 (√13)",
          why: {
            ko: "두 벡터 사이의 유클리드 거리입니다. MSE는 제곱근을 씌우지 않아요.",
            en: "That's the Euclidean distance between the vectors. MSE takes no square root."
          }
        }
      ],
      explain: {
        ko: "손실 함수는 (출력, 정답) 쌍을 받아 '얼마나 틀렸는지'를 숫자 하나로 돌려줍니다.\n- 회귀(연속값 예측): `nn.MSELoss`, `nn.L1Loss`\n- 분류: `nn.CrossEntropyLoss`\n\n튜토리얼은 흐름을 보여 주려고 MSE를 썼어요. `loss.grad_fn`을 따라가면 `MseLossBackward0` → `AddmmBackward0`(fc3) → … 처럼 계산 그래프를 거꾸로 탐색할 수 있습니다.",
        en: "A loss function takes an (output, target) pair and returns one number measuring how wrong the output is.\n- Regression (continuous targets): `nn.MSELoss`, `nn.L1Loss`\n- Classification: `nn.CrossEntropyLoss`\n\nThe tutorial uses MSE just to show the workflow. Following `loss.grad_fn` lets you walk the graph backwards: `MseLossBackward0` → `AddmmBackward0` (fc3) → …"
      },
      tryit: `
out = net(torch.randn(1, 1, 32, 32))
target = torch.randn(10).view(1, -1)   # same shape as out: (1, 10)
loss = nn.MSELoss()(out, target)
print(loss.grad_fn)                          # MseLossBackward0
print(loss.grad_fn.next_functions[0][0])     # AddmmBackward0 (fc3)
`
    },
    {
      id: "n9", tag: "beyond",
      topic: { ko: "shape 불일치와 조용한 브로드캐스팅", en: "Shape mismatch and silent broadcasting" },
      q: {
        ko: "예측이 정답과 완전히 같아 보이는데, 다음 `loss`의 값은?",
        en: "The predictions look identical to the targets. What is `loss`?"
      },
      code: `
output = torch.tensor([[1.], [2.], [3.], [4.]])   # shape (4, 1)
target = torch.tensor([1., 2., 3., 4.])           # shape (4,)
loss = nn.MSELoss()(output, target)
`,
      options: [
        {
          ok: true,
          t: "2.5",
          why: {
            ko: "`(4, 1)`과 `(4,)`는 브로드캐스팅으로 `(4, 4)`가 되어 16쌍의 차이를 평균냅니다. 에러가 아니라서 모르고 지나치기 쉬운 대표적인 버그예요. `output.squeeze(1)`로 shape을 맞추면 0이 됩니다.",
            en: "`(4, 1)` and `(4,)` broadcast to `(4, 4)`, averaging 16 pairwise differences. Since it's not an error, it's a classic bug that slips by. Match the shapes with `output.squeeze(1)` and the loss becomes 0."
          }
        },
        {
          t: "0.0",
          why: {
            ko: "값은 같아 보여도 shape이 달라서 원소끼리 1:1로 비교되지 않습니다.",
            en: "The values look the same, but the shapes differ, so elements aren't compared one-to-one."
          }
        },
        {
          t: { ko: "RuntimeError: shape이 다르면 손실을 계산할 수 없다", en: "RuntimeError: different shapes can't be compared" },
          why: {
            ko: "브로드캐스팅이 가능한 shape이라 에러 없이 계산됩니다. 그래서 더 위험해요.",
            en: "The shapes are broadcastable, so it computes without error. That's what makes it dangerous."
          }
        },
        {
          t: "40.0",
          why: {
            ko: "브로드캐스팅된 16쌍의 제곱 오차 **합**입니다. MSELoss의 기본값은 평균이라 40 / 16 = 2.5예요.",
            en: "That's the **sum** of the 16 broadcast squared errors. MSELoss averages by default: 40 / 16 = 2.5."
          }
        }
      ],
      explain: {
        ko: "튜토리얼이 `target = target.view(1, -1)`로 정답의 shape을 출력 `(1, 10)`과 똑같이 맞춘 이유가 여기 있어요 (`-1`은 '남은 크기는 알아서 계산하라'는 뜻).\n\n습관: 손실을 계산하기 전에 `output.shape`과 `target.shape`이 같은지 확인하세요. `Using a target size ... that is different to the input size` 경고는 절대 무시하면 안 됩니다!",
        en: "This is why the tutorial reshapes the target with `target = target.view(1, -1)` to match the output's `(1, 10)` exactly (`-1` means 'infer this size').\n\nHabit: check that `output.shape` equals `target.shape` before computing a loss, and never ignore the `Using a target size ... that is different to the input size` warning!"
      },
      tryit: `
output = torch.tensor([[1.], [2.], [3.], [4.]])
target = torch.tensor([1., 2., 3., 4.])
print(nn.MSELoss()(output, target))              # tensor(2.5000) + UserWarning
print(nn.MSELoss()(output.squeeze(1), target))   # tensor(0.)
`
    },
    {
      id: "n10", tag: "beyond",
      topic: { ko: "zero_grad()는 실제로 무엇을 할까", en: "What zero_grad() actually does" },
      q: {
        ko: "PyTorch 2.x에서 다음 코드의 출력은?",
        en: "In PyTorch 2.x, what does this code print?"
      },
      code: `
optimizer = optim.SGD(net.parameters(), lr=0.01)
loss = criterion(net(input), target)
loss.backward()
optimizer.zero_grad()
print(net.conv1.bias.grad)
`,
      options: [
        {
          ok: true,
          t: "`None`",
          why: {
            ko: "PyTorch 2.0부터 `zero_grad()`의 기본값이 `set_to_none=True`라서, 기울기를 0으로 채우는 대신 `None`으로 바꿉니다. 메모리 할당과 0 채우기를 생략해 조금 더 효율적이에요.",
            en: "Since PyTorch 2.0, `zero_grad()` defaults to `set_to_none=True`: instead of filling gradients with zeros, it sets them to `None`. Skipping the allocation and zero-fill is slightly more efficient."
          }
        },
        {
          t: "`tensor([0., 0., 0., 0., 0., 0.])`",
          why: {
            ko: "`zero_grad(set_to_none=False)`를 쓰거나 PyTorch 1.x일 때의 결과입니다. 이름은 'zero'지만 지금의 기본 동작은 `None`이에요.",
            en: "That's what you get with `zero_grad(set_to_none=False)` or in PyTorch 1.x. Despite the name, the current default is `None`."
          }
        },
        {
          t: { ko: "이전 기울기 값이 그대로 남아 있다", en: "The previous gradient values remain" },
          why: {
            ko: "`zero_grad()`는 기울기를 확실히 비웁니다. 그게 존재 이유예요.",
            en: "`zero_grad()` definitely clears the gradients. That's its whole purpose."
          }
        },
        {
          t: "`AttributeError`",
          why: {
            ko: "`.grad` 속성은 항상 존재하고, 값이 `None`일 뿐입니다.",
            en: "The `.grad` attribute always exists; its value is just `None`."
          }
        }
      ],
      explain: {
        ko: "기울기는 `.backward()`마다 누적되므로 매 반복 전에 비워야 합니다 (튜토리얼의 Backprop 절).\n- `net.zero_grad()`: 모델의 모든 파라미터 기울기 비우기\n- `optimizer.zero_grad()`: 옵티마이저에 등록된 파라미터의 기울기 비우기 (보통 이걸 씀)\n\n`None`이든 0이든 다음 `backward()`의 결과는 같습니다. 다만 `.grad`를 직접 읽는 코드를 짠다면 `None`일 수 있다는 걸 기억하세요. 튜토리얼에서 `backward()` 전에 출력한 `conv1.bias.grad`가 `None`인 것도 같은 이유예요.",
        en: "Gradients accumulate on every `.backward()`, so they must be cleared before each iteration (the tutorial's Backprop section).\n- `net.zero_grad()`: clears gradients of all the model's parameters\n- `optimizer.zero_grad()`: clears gradients of the optimizer's parameters (the usual choice)\n\n`None` or zeros, the next `backward()` gives the same result. But if your code reads `.grad` directly, remember it may be `None`. It's also why the tutorial's `conv1.bias.grad` prints `None` before `backward()`."
      },
      tryit: `
print(net.conv1.bias.grad)                   # None (no backward yet)
net(torch.randn(1, 1, 32, 32)).sum().backward()
print(net.conv1.bias.grad is not None)       # True
net.zero_grad(set_to_none=False)
print(net.conv1.bias.grad)                   # tensor([0., 0., 0., 0., 0., 0.])
net.zero_grad()
print(net.conv1.bias.grad)                   # None
`
    },
    {
      id: "n11", tag: "tutorial",
      topic: { ko: "수동 가중치 갱신과 no_grad", en: "Manual weight updates and no_grad" },
      q: {
        ko: "튜토리얼은 수동 SGD 갱신을 `with torch.no_grad():` 안에서 합니다. 아래처럼 `no_grad` 없이 실행하면?",
        en: "The tutorial does the manual SGD update inside `with torch.no_grad():`. What happens without `no_grad`, as below?"
      },
      code: `
learning_rate = 0.01
loss.backward()
for f in net.parameters():
    f.sub_(f.grad * learning_rate)   # no torch.no_grad()
`,
      options: [
        {
          ok: true,
          t: { ko: "RuntimeError (추적 중인 리프 텐서를 in-place로 수정)", en: "RuntimeError (in-place change to a leaf that requires grad)" },
          why: {
            ko: "실제 메시지: `a leaf Variable that requires grad is being used in an in-place operation.` 가중치 갱신은 모델 계산의 일부가 아니므로 그래프에 기록되면 안 됩니다. `no_grad` 안에서는 기록이 꺼져 있어 허용돼요.",
            en: "Actual message: `a leaf Variable that requires grad is being used in an in-place operation.` A weight update isn't part of the model's computation and must not be recorded. Inside `no_grad`, recording is off, so it's allowed."
          }
        },
        {
          t: { ko: "정상 동작하지만, 갱신 연산까지 그래프에 기록되어 조금 느려진다", en: "It works, but the update gets recorded in the graph, so it's a bit slower" },
          why: {
            ko: "기록이 켜진 상태에서는 리프 파라미터를 in-place로 수정하는 것 자체가 금지되어 에러가 납니다.",
            en: "With recording on, modifying a leaf parameter in place is forbidden outright, so it errors."
          }
        },
        {
          t: { ko: "에러 없이 실행되지만 가중치가 반대 방향(경사 상승)으로 갱신된다", en: "It runs, but the weights move in the opposite direction (gradient ascent)" },
          why: {
            ko: "`sub_`는 빼기이므로 방향은 맞습니다. 문제는 autograd 기록이에요.",
            en: "`sub_` subtracts, so the direction is right. The problem is autograd recording."
          }
        },
        {
          t: { ko: "`sub_`가 기울기까지 바꿔서 모든 `.grad`가 0으로 초기화된다", en: "`sub_` also changes the gradients, resetting every `.grad` to zero" },
          why: {
            ko: "`sub_`는 파라미터 값에서 빼는 연산일 뿐, 기울기를 초기화하지 않습니다.",
            en: "`sub_` only subtracts from the parameter values; it doesn't touch the gradients."
          }
        }
      ],
      explain: {
        ko: "`torch.no_grad()`의 대표적인 용도 두 가지: ① 평가·추론 ② 파라미터를 직접 수정할 때.\n\n실제로 `optimizer.step()`도 내부에서 `no_grad` 상태로 갱신합니다. Tensors 퀴즈에서 본 'in-place 연산은 미분에 문제가 될 수 있다'는 경고가 실제로 나타나는 사례예요.",
        en: "The two classic uses of `torch.no_grad()`: (1) evaluation/inference and (2) modifying parameters directly.\n\nUnder the hood, `optimizer.step()` also updates inside `no_grad`. This is the 'in-place ops can be problematic for derivatives' warning from the Tensors quiz in action."
      },
      tryit: `
net.zero_grad()
net(torch.randn(1, 1, 32, 32)).sum().backward()   # make some gradients
learning_rate = 0.01
try:
    for f in net.parameters():
        f.sub_(f.grad * learning_rate)
except RuntimeError as e:
    print(e)   # a leaf Variable that requires grad is being used in an in-place operation.
with torch.no_grad():
    for f in net.parameters():
        f.sub_(f.grad * learning_rate)   # OK inside no_grad
print("updated!")
`
    },
    {
      id: "n12", tag: "tutorial",
      topic: { ko: "SGD 갱신 규칙과 torch.optim", en: "The SGD update rule and torch.optim" },
      q: {
        ko: "SGD 규칙 `weight = weight - learning_rate * gradient`에서 weight = 1.0, gradient = 2.0, lr = 0.01이면 `optimizer.step()` 후 weight는? (momentum 없음)",
        en: "With the SGD rule `weight = weight - learning_rate * gradient`, weight = 1.0, gradient = 2.0 and lr = 0.01, what is the weight after `optimizer.step()`? (no momentum)"
      },
      code: `
w = nn.Parameter(torch.tensor(1.0))
optimizer = optim.SGD([w], lr=0.01)
w.grad = torch.tensor(2.0)
optimizer.step()
print(w)
`,
      options: [
        {
          ok: true,
          t: "0.98",
          why: {
            ko: "1.0 − 0.01 × 2.0 = 0.98. 기울기는 손실이 **증가**하는 방향을 가리키므로, 반대(−)로 움직여야 손실이 줄어요.",
            en: "1.0 − 0.01 × 2.0 = 0.98. The gradient points in the direction where the loss **increases**, so we step the opposite way (−) to decrease it."
          }
        },
        {
          t: "1.02",
          why: {
            ko: "기울기 방향으로 더하면 손실이 커지는 쪽(경사 상승)으로 갑니다.",
            en: "Adding the gradient moves toward a larger loss (gradient ascent)."
          }
        },
        {
          t: "0.8",
          why: {
            ko: "학습률을 0.1로 계산했습니다. 학습률은 한 번에 얼마나 크게 움직일지 정하는 중요한 하이퍼파라미터예요.",
            en: "That uses a learning rate of 0.1. The learning rate is a key hyperparameter that sets the step size."
          }
        },
        {
          t: "-1.0",
          why: {
            ko: "학습률을 곱하지 않고 1.0 − 2.0을 했습니다. 기울기만큼 통째로 움직이면 보폭이 너무 커서 발산하기 쉬워요.",
            en: "That computes 1.0 − 2.0 without the learning rate. Stepping by the full gradient is usually too big a step and tends to diverge."
          }
        }
      ],
      explain: {
        ko: "튜토리얼의 `torch.optim` 학습 루프: `optimizer.zero_grad()` → `output = net(input)` → `loss = criterion(output, target)` → `loss.backward()` → `optimizer.step()`\n\n`torch.optim`에는 SGD 외에도 Nesterov-SGD, Adam, RMSProp 등이 있어요. Adam은 파라미터마다 보폭을 자동으로 조절해 줘서 처음 시작할 때 많이 씁니다. 학습률이 너무 크면 손실이 발산하고, 너무 작으면 학습이 느려져요.",
        en: "The tutorial's `torch.optim` loop: `optimizer.zero_grad()` → `output = net(input)` → `loss = criterion(output, target)` → `loss.backward()` → `optimizer.step()`\n\n`torch.optim` also offers Nesterov-SGD, Adam, RMSProp and more. Adam adapts the step size per parameter and is a popular starting point. Too large a learning rate makes the loss diverge; too small makes training slow."
      },
      tryit: `
w = nn.Parameter(torch.tensor(1.0))
optimizer = optim.SGD([w], lr=0.01)
w.grad = torch.tensor(2.0)
optimizer.step()
print(w)   # tensor(0.9800, requires_grad=True)
`
    }
  ]
});
