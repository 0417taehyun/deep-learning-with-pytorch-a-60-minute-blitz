// Quiz questions for "Tensors".
// Loaded by quiz.html in this folder and by ../main.html (quiz home + mixed practice).
//
// Format: each question has an id (unique across all chapters), tag "tutorial" | "beyond",
// bilingual { ko, en } text, and 4 options with exactly one `ok: true`. Every option has a `why`.
// Optional: `code` (shown under the question), `tryit` (runnable snippet shown after answering).
// Text supports `inline code`, **bold**, "- " bullet lines, and blank-line paragraphs.
(window.QUIZ_CHAPTERS = window.QUIZ_CHAPTERS || []).push({
  id: "tensors",
  dir: "1",
  title: { ko: "텐서 (Tensors)", en: "Tensors" },
  summary: { ko: "텐서 생성, dtype·device, 인덱싱과 연산, in-place 연산, NumPy 브리지", en: "Creating tensors, dtype & device, indexing & operations, in-place ops, the NumPy bridge" },
  source: "https://docs.pytorch.org/tutorials/beginner/blitz/tensor_tutorial.html",
  questions: [
    {
      id: "t1", tag: "tutorial",
      topic: { ko: "텐서란?", en: "What is a tensor?" },
      q: {
        ko: "튜토리얼은 텐서가 NumPy의 ndarray와 비슷하다고 설명합니다. 그렇다면 텐서가 ndarray와 **다른** 핵심 특징은 무엇일까요?",
        en: "The tutorial says tensors are similar to NumPy's ndarrays. What key feature makes tensors **different**?"
      },
      options: [
        {
          ok: true,
          t: { ko: "GPU 같은 가속기에서 실행할 수 있고 자동 미분에 최적화되어 있다", en: "They can run on GPUs/accelerators and are optimized for autograd" },
          why: {
            ko: "튜토리얼의 핵심 문장입니다. 같은 자료구조로 모델의 입력·출력·파라미터를 모두 표현하면서, `.to(device)`로 가속기에 올리고 `requires_grad`로 미분을 추적할 수 있다는 점이 ndarray와의 결정적인 차이예요.",
            en: "That's the tutorial's key point. One data structure encodes a model's inputs, outputs and parameters, can be moved to an accelerator with `.to(device)`, and can track gradients via `requires_grad`. An ndarray can do neither."
          }
        },
        {
          t: { ko: "정수는 담을 수 없고 실수(float) 값만 담을 수 있다", en: "Unlike arrays, they can only store floating-point values" },
          why: {
            ko: "`torch.tensor([[1, 2], [3, 4]])`의 dtype은 `torch.int64`입니다. 텐서는 정수, 실수, bool, 복소수 등 다양한 dtype을 지원해요.",
            en: "`torch.tensor([[1, 2], [3, 4]])` has dtype `torch.int64`. Tensors support many dtypes: integers, floats, bools, complex numbers and more."
          }
        },
        {
          t: { ko: "NumPy 배열과는 서로 변환할 수 없는 별개의 자료구조다", en: "They are a separate structure that can't be converted to/from NumPy" },
          why: {
            ko: "`torch.from_numpy()`와 `.numpy()`로 자유롭게 오갈 수 있고, CPU에서는 메모리까지 공유합니다 (튜토리얼의 'Bridge with NumPy' 섹션).",
            en: "`torch.from_numpy()` and `.numpy()` convert both ways, and on the CPU they even share memory (see 'Bridge with NumPy')."
          }
        },
        {
          t: { ko: "한 번 만들면 값을 바꿀 수 없는 불변(immutable) 객체다", en: "They are immutable: values can't change after creation" },
          why: {
            ko: "`tensor[:, 1] = 0`이나 `tensor.add_(5)`처럼 값을 직접 바꿀 수 있습니다. 텐서는 가변(mutable) 객체예요.",
            en: "You can change values directly, e.g. `tensor[:, 1] = 0` or `tensor.add_(5)`. Tensors are mutable."
          }
        }
      ],
      explain: {
        ko: "텐서 = 다차원 배열 + **가속기 지원** + **자동 미분 지원**.\n\n딥러닝에서는 입력 데이터, 모델 출력, 학습할 가중치가 모두 텐서입니다. 연산 이름과 동작 대부분이 NumPy와 비슷해서 NumPy를 알면 금방 익숙해져요.",
        en: "Tensor = multi-dimensional array + **accelerator support** + **autograd support**.\n\nIn deep learning, input data, model outputs and learnable weights are all tensors. Most operations look and behave like NumPy, so NumPy knowledge transfers directly."
      }
    },
    {
      id: "t2", tag: "tutorial",
      topic: { ko: "*_like 함수와 dtype", en: "*_like functions and dtype" },
      q: {
        ko: "`main.py`에서 `torch.rand_like(x_data, dtype=torch.float)`처럼 `dtype`을 지정했습니다. `dtype`을 빼고 `torch.rand_like(x_data)`만 호출하면 어떻게 될까요?",
        en: "In `main.py` you called `torch.rand_like(x_data, dtype=torch.float)`. What happens if you drop `dtype` and call just `torch.rand_like(x_data)`?"
      },
      code: `
x_data = torch.tensor([[1, 2], [3, 4]])
x_ones = torch.ones_like(x_data)   # OK
x_rand = torch.rand_like(x_data)   # without dtype?
`,
      options: [
        {
          ok: true,
          t: { ko: "에러가 난다 (원본의 `int64` dtype을 그대로 따르기 때문)", en: "It raises an error (it inherits the original `int64` dtype)" },
          why: {
            ko: "실제로 `NotImplementedError: \"check_uniform_bounds\" not implemented for 'Long'`이 발생합니다. `ones_like`는 정수 1로 채우면 되니 문제없지만, `rand_like`는 실수가 필요하죠. 그래서 튜토리얼이 `dtype=torch.float`로 덮어쓴 거예요.",
            en: "You actually get `NotImplementedError: \"check_uniform_bounds\" not implemented for 'Long'`. `ones_like` is fine because it fills with integer 1s, but `rand_like` needs floats. That's why the tutorial overrides `dtype=torch.float`."
          }
        },
        {
          t: { ko: "난수가 반올림되어 0 또는 1만 들어 있는 정수 텐서가 된다", en: "Random values are rounded, giving an integer tensor of 0s and 1s" },
          why: {
            ko: "PyTorch는 난수를 정수로 몰래 '반올림'해 주지 않습니다. 정수 난수가 필요하면 `torch.randint_like`를 써야 해요.",
            en: "PyTorch doesn't silently round random floats to integers. For random integers, use `torch.randint_like`."
          }
        },
        {
          t: { ko: "난수는 실수여야 하므로 자동으로 float32로 바뀌어 정상 동작한다", en: "Random values must be floats, so it switches to float32 and works" },
          why: {
            ko: "`*_like` 함수는 shape뿐 아니라 dtype·device도 원본을 따르는 것이 원칙입니다. 자동 변환은 일어나지 않아요.",
            en: "`*_like` functions copy the shape *and* the dtype/device of the original by design. No automatic conversion happens."
          }
        },
        {
          t: { ko: "원본과 shape이 맞지 않아서 에러가 난다", en: "It errors because the shape doesn't match the original" },
          why: {
            ko: "`*_like`는 원본의 shape을 그대로 가져오므로 shape 문제는 생길 수 없습니다. 문제는 dtype이에요.",
            en: "`*_like` takes the shape from the original, so a shape mismatch is impossible. The problem is the dtype."
          }
        }
      ],
      explain: {
        ko: "`torch.ones_like(x)`, `torch.zeros_like(x)`, `torch.rand_like(x)`는 **x의 shape, dtype, device를 물려받습니다**. 필요한 속성만 인자로 덮어쓰면 돼요.\n\n참고로 `torch.float`는 `torch.float32`의 별칭입니다 (float64가 아니에요!).",
        en: "`torch.ones_like(x)`, `zeros_like` and `rand_like` **inherit x's shape, dtype and device**. Override only what you need with arguments.\n\nNote: `torch.float` is an alias for `torch.float32` (not float64!)."
      },
      tryit: `
x_data = torch.tensor([[1, 2], [3, 4]])
print(x_data.dtype)                   # torch.int64
print(torch.float is torch.float32)   # True
try:
    torch.rand_like(x_data)
except Exception as e:
    print(type(e).__name__, e)
print(torch.rand_like(x_data, dtype=torch.float))
`
    },
    {
      id: "t3", tag: "beyond",
      topic: { ko: "dtype 추론 규칙", en: "dtype inference rules" },
      q: {
        ko: "다음 두 텐서의 dtype은 각각 무엇일까요?",
        en: "What are the dtypes of these two tensors?"
      },
      code: `
a = torch.tensor([[1, 2], [3, 4]])
b = torch.from_numpy(np.array([1.0, 2.0]))
print(a.dtype, b.dtype)
`,
      options: [
        {
          ok: true,
          t: "`torch.int64`, `torch.float64`",
          why: {
            ko: "파이썬 정수 리스트는 `int64`로 추론됩니다. NumPy는 실수의 기본 dtype이 `float64`이고, `from_numpy`는 그 dtype을 그대로 유지해요.",
            en: "A list of Python ints becomes `int64`. NumPy's default float type is `float64`, and `from_numpy` keeps the dtype as is."
          }
        },
        {
          t: "`torch.int32`, `torch.float32`",
          why: {
            ko: "PyTorch의 기본 정수형은 `int32`가 아니라 `int64`입니다. 그리고 `from_numpy`는 NumPy의 `float64`를 `float32`로 바꾸지 않아요.",
            en: "PyTorch's default integer type is `int64`, not `int32`, and `from_numpy` doesn't downcast NumPy's `float64` to `float32`."
          }
        },
        {
          t: "`torch.float32`, `torch.float32`",
          why: {
            ko: "`torch.tensor`는 데이터를 보고 dtype을 추론합니다. 정수만 있으면 정수 텐서가 돼요. `float32`는 `torch.tensor([1.0, 2.0])`처럼 파이썬 실수로 만들 때의 기본값입니다.",
            en: "`torch.tensor` infers the dtype from the data, and all-integer data gives an integer tensor. `float32` is the default only for Python floats, e.g. `torch.tensor([1.0, 2.0])`."
          }
        },
        {
          t: "`torch.int64`, `torch.float32`",
          why: {
            ko: "앞부분은 맞지만, `from_numpy`는 NumPy 배열의 메모리를 그대로 공유하므로 dtype도 바꿀 수 없습니다. 결과는 `float64`예요.",
            en: "The first half is right, but `from_numpy` shares the NumPy array's memory, so it can't change the dtype either. The result is `float64`."
          }
        }
      ],
      explain: {
        ko: "dtype 규칙 정리:\n- 파이썬 정수 → `int64`\n- 파이썬 실수 → `float32` (`torch.get_default_dtype()`)\n- NumPy 실수 배열 → `float64` (`from_numpy`가 그대로 유지)\n\n실전 팁: 모델 가중치는 보통 `float32`라서, NumPy에서 온 `float64` 데이터를 그대로 넣으면 dtype 불일치 에러가 나기 쉽습니다. `.float()`로 변환하세요. 특히 Mac의 MPS는 `float64`를 아예 지원하지 않아요.",
        en: "dtype rules:\n- Python ints → `int64`\n- Python floats → `float32` (`torch.get_default_dtype()`)\n- NumPy float arrays → `float64` (kept by `from_numpy`)\n\nPractical tip: model weights are usually `float32`, so feeding `float64` data that came from NumPy often causes dtype-mismatch errors. Convert with `.float()`. On a Mac, MPS doesn't support `float64` at all."
      },
      tryit: `
import numpy as np
a = torch.tensor([[1, 2], [3, 4]])
b = torch.from_numpy(np.array([1.0, 2.0]))
print(a.dtype, b.dtype)            # torch.int64 torch.float64
print(torch.tensor([1.0]).dtype)   # torch.float32
print(b.float().dtype)             # torch.float32
`
    },
    {
      id: "t4", tag: "tutorial",
      topic: { ko: "인덱싱과 슬라이싱", en: "Indexing and slicing" },
      q: {
        ko: "다음 코드에서 `t[:, 1]`의 결과는?",
        en: "What does `t[:, 1]` return?"
      },
      code: `
t = torch.arange(16).reshape(4, 4)
# tensor([[ 0,  1,  2,  3],
#         [ 4,  5,  6,  7],
#         [ 8,  9, 10, 11],
#         [12, 13, 14, 15]])
print(t[:, 1])
`,
      options: [
        {
          ok: true,
          t: "`tensor([ 1,  5,  9, 13])`",
          why: {
            ko: "`:`는 '모든 행', `1`은 '두 번째 열'입니다. 정수 인덱스로 고른 차원은 사라지므로 shape `(4,)`인 1차원 텐서가 돼요.",
            en: "`:` means all rows and `1` picks the second column. A dimension indexed by an integer disappears, so the result is 1-D with shape `(4,)`."
          }
        },
        {
          t: "`tensor([4, 5, 6, 7])`",
          why: {
            ko: "두 번째 **행**인 `t[1]` (= `t[1, :]`)의 결과입니다. 콤마 앞이 행, 뒤가 열이에요.",
            en: "That's the second **row**, `t[1]` (= `t[1, :]`). Before the comma is rows, after it is columns."
          }
        },
        {
          t: "`tensor([[ 1], [ 5], [ 9], [13]])`",
          why: {
            ko: "shape `(4, 1)`로 차원을 유지하려면 `t[:, 1:2]`처럼 **슬라이스**를 써야 합니다. 정수 인덱스는 차원을 없애요.",
            en: "To keep the dimension (shape `(4, 1)`), you need a **slice** like `t[:, 1:2]`. An integer index drops the dimension."
          }
        },
        {
          t: "`tensor([0, 1, 2, 3])`",
          why: {
            ko: "첫 번째 행 `t[0]`의 결과입니다.",
            en: "That's the first row, `t[0]`."
          }
        }
      ],
      explain: {
        ko: "NumPy와 같은 인덱싱 규칙입니다.\n- `t[0]` → 첫 번째 행\n- `t[:, 0]` → 첫 번째 열\n- `t[..., -1]` → 마지막 열 (`...`은 '앞의 모든 차원')\n- `t[:, 1] = 0` → 두 번째 열 전체에 0 대입 (main.py에서 해 본 것!)\n\n정수 인덱스는 차원을 줄이고, 슬라이스(`a:b`)는 차원을 유지한다는 점을 기억하세요.",
        en: "Same rules as NumPy:\n- `t[0]` → first row\n- `t[:, 0]` → first column\n- `t[..., -1]` → last column (`...` = all leading dims)\n- `t[:, 1] = 0` → set the whole second column to 0 (what you did in main.py!)\n\nRemember: an integer index removes a dimension; a slice (`a:b`) keeps it."
      },
      tryit: `
t = torch.arange(16).reshape(4, 4)
print(t[:, 1], t[:, 1].shape)        # shape (4,)
print(t[:, 1:2], t[:, 1:2].shape)    # shape (4, 1)
print(t[..., -1])                    # last column
`
    },
    {
      id: "t5", tag: "tutorial",
      topic: { ko: "텐서 이어 붙이기", en: "Joining tensors" },
      q: {
        ko: "`t`의 shape이 `(4, 4)`일 때 `torch.cat([t, t, t], dim=1)`의 shape은?",
        en: "If `t` has shape `(4, 4)`, what is the shape of `torch.cat([t, t, t], dim=1)`?"
      },
      options: [
        {
          ok: true,
          t: "`(4, 12)`",
          why: {
            ko: "`dim=1`(열 방향)으로 이어 붙이므로 그 차원만 4 + 4 + 4 = 12가 됩니다. 나머지 차원(행 4개)은 그대로예요.",
            en: "Joining along `dim=1` (columns) adds up only that dimension: 4 + 4 + 4 = 12. The other dimension (4 rows) is unchanged."
          }
        },
        {
          t: "`(12, 4)`",
          why: {
            ko: "`dim=0`(행 방향)으로 붙였을 때의 결과입니다.",
            en: "That's what `dim=0` (stacking rows) gives."
          }
        },
        {
          t: "`(3, 4, 4)`",
          why: {
            ko: "새 차원을 만들어 쌓는 건 `torch.stack`입니다. `cat`은 기존 차원을 따라 이어 붙일 뿐이라 차원 수가 늘지 않아요.",
            en: "Creating a new dimension is what `torch.stack` does. `cat` joins along an existing dimension, so the number of dims never grows."
          }
        },
        {
          t: "`(4, 4)`",
          why: {
            ko: "`cat`은 원소끼리 더하는 게 아니라 이어 붙이는 연산이라 크기가 커집니다.",
            en: "`cat` concatenates instead of adding element-wise, so the size grows."
          }
        }
      ],
      explain: {
        ko: "- `torch.cat(tensors, dim)`: 기존 차원을 따라 **이어 붙이기**. 그 차원 크기만 합쳐지고, 나머지 차원은 모두 같아야 함\n- `torch.stack(tensors, dim)`: **새 차원**을 만들어 쌓기. 모든 텐서의 shape이 완전히 같아야 함\n\n예: 이미지 4장 `(3, 32, 32)`를 배치 `(4, 3, 32, 32)`로 만드는 건 `stack`입니다. DataLoader가 내부에서 이렇게 배치를 만들어요.",
        en: "- `torch.cat(tensors, dim)`: **concatenate** along an existing dim. Only that dim's size adds up; all other dims must match\n- `torch.stack(tensors, dim)`: stack along a **new** dim. All shapes must be identical\n\nE.g. turning four `(3, 32, 32)` images into a batch `(4, 3, 32, 32)` is a `stack`. That's what DataLoader does under the hood."
      },
      tryit: `
t = torch.ones(4, 4)
print(torch.cat([t, t, t], dim=0).shape)   # (12, 4)
print(torch.cat([t, t, t], dim=1).shape)   # (4, 12)
print(torch.stack([t, t, t]).shape)        # (3, 4, 4)
`
    },
    {
      id: "t6", tag: "tutorial",
      topic: { ko: "원소별 곱 vs 행렬 곱", en: "Element-wise vs matrix product" },
      q: {
        ko: "다음 중 결과가 `tensor([[ 7, 10], [15, 22]])`인 것은?",
        en: "Which expression evaluates to `tensor([[ 7, 10], [15, 22]])`?"
      },
      code: `
A = torch.tensor([[1, 2],
                  [3, 4]])
`,
      options: [
        {
          ok: true,
          t: "`A @ A`",
          why: {
            ko: "`@`(= `A.matmul(A)`)는 행렬 곱입니다. (1행·1열) 1×1 + 2×3 = 7, (1행·2열) 1×2 + 2×4 = 10, (2행·1열) 3×1 + 4×3 = 15, (2행·2열) 3×2 + 4×4 = 22.",
            en: "`@` (= `A.matmul(A)`) is matrix multiplication. (row1·col1) 1×1 + 2×3 = 7, (row1·col2) 1×2 + 2×4 = 10, (row2·col1) 3×1 + 4×3 = 15, (row2·col2) 3×2 + 4×4 = 22."
          }
        },
        {
          t: "`A * A`",
          why: {
            ko: "`*`(= `A.mul(A)`)는 같은 위치끼리 곱하는 원소별 곱이라 `[[1, 4], [9, 16]]`이 됩니다.",
            en: "`*` (= `A.mul(A)`) multiplies element-wise, giving `[[1, 4], [9, 16]]`."
          }
        },
        {
          t: "`A ** 2`",
          why: {
            ko: "각 원소를 제곱하므로 `A * A`와 같은 `[[1, 4], [9, 16]]`입니다. 행렬의 거듭제곱이 아니에요 (그건 `torch.linalg.matrix_power`).",
            en: "It squares each element, same as `A * A`: `[[1, 4], [9, 16]]`. It's not a matrix power (that's `torch.linalg.matrix_power`)."
          }
        },
        {
          t: "`A.T @ A`",
          why: {
            ko: "전치한 뒤 곱하면 `[[10, 14], [14, 20]]`입니다. 튜토리얼의 `tensor @ tensor.T`처럼 전치 여부에 따라 결과가 달라져요.",
            en: "Transposing first gives `[[10, 14], [14, 20]]`. As with the tutorial's `tensor @ tensor.T`, transposing changes the result."
          }
        }
      ],
      explain: {
        ko: "- 원소별 곱: `A * B`, `A.mul(B)`, `torch.mul(A, B)`. 두 shape이 같거나 브로드캐스팅 가능해야 함\n- 행렬 곱: `A @ B`, `A.matmul(B)`, `torch.matmul(A, B)`. `(m, n) @ (n, p) → (m, p)`, 즉 A의 열 수 = B의 행 수\n\n신경망의 `nn.Linear`가 하는 일이 바로 이 행렬 곱(`x @ W.T + b`)입니다.",
        en: "- Element-wise: `A * B`, `A.mul(B)`, `torch.mul(A, B)`. Shapes must match or be broadcastable\n- Matrix product: `A @ B`, `A.matmul(B)`, `torch.matmul(A, B)`. `(m, n) @ (n, p) → (m, p)`, so A's columns must equal B's rows\n\nThis matrix product is exactly what `nn.Linear` computes: `x @ W.T + b`."
      },
      tryit: `
A = torch.tensor([[1, 2], [3, 4]])
print(A @ A)     # matrix product
print(A * A)     # element-wise
print(A.T @ A)
`
    },
    {
      id: "t7", tag: "beyond",
      topic: { ko: "브로드캐스팅", en: "Broadcasting" },
      q: {
        ko: "`a = torch.ones(2, 3)`일 때, 다음 중 **에러가 나는** 덧셈은?",
        en: "Given `a = torch.ones(2, 3)`, which addition **raises an error**?"
      },
      options: [
        {
          ok: true,
          t: "`a + torch.ones(2)`",
          why: {
            ko: "브로드캐스팅은 **뒤쪽(오른쪽) 차원부터** 맞춰 봅니다. `(2, 3)`과 `(2,)`를 오른쪽 정렬하면 3과 2를 비교하게 되고, 둘 다 1이 아니므로 에러입니다: `The size of tensor a (3) must match the size of tensor b (2) at non-singleton dimension 1`.",
            en: "Broadcasting aligns shapes **from the trailing (right-most) dimension**. Right-aligning `(2, 3)` and `(2,)` compares 3 with 2; neither is 1, so it fails: `The size of tensor a (3) must match the size of tensor b (2) at non-singleton dimension 1`."
          }
        },
        {
          t: "`a + torch.ones(3)`",
          why: {
            ko: "`(3,)`은 `(1, 3)`처럼 취급되어 각 행에 더해집니다. 결과 shape은 `(2, 3)`.",
            en: "`(3,)` is treated like `(1, 3)` and added to every row. The result has shape `(2, 3)`."
          }
        },
        {
          t: "`a + torch.ones(1, 3)`",
          why: {
            ko: "크기가 1인 차원은 늘어날 수 있으므로 `(1, 3)`이 `(2, 3)`으로 확장되어 정상 동작합니다.",
            en: "A size-1 dim can be stretched, so `(1, 3)` expands to `(2, 3)` and it works."
          }
        },
        {
          t: "`a + torch.ones(2, 1)`",
          why: {
            ko: "`(2, 1)`의 열 차원이 1이라 3으로 늘어나 각 열에 더해집니다. 결과는 `(2, 3)`.",
            en: "The column dim of `(2, 1)` is 1, so it stretches to 3 and is added to every column. The result is `(2, 3)`."
          }
        }
      ],
      explain: {
        ko: "**브로드캐스팅 규칙**: 두 shape을 오른쪽 끝부터 한 차원씩 비교해서, 각 쌍이 (1) 같거나 (2) 한쪽이 1이거나 (3) 한쪽에 차원이 없으면 OK. 크기 1인 쪽은 복사된 것처럼 늘어납니다 (실제 메모리 복사는 없어요).\n\n튜토리얼의 `tensor.add_(5)`도 스칼라 5가 모든 원소로 브로드캐스팅된 것입니다. 이 규칙을 모르면 shape이 몰래 커지는 버그를 만들기 쉬워요 (Neural Networks 퀴즈에서 실제 사례가 나와요).",
        en: "**Broadcasting rule**: compare the shapes one dimension at a time from the right. Each pair must (1) be equal, (2) have a 1 on one side, or (3) be missing on one side. Size-1 dims are virtually stretched (no actual memory copy).\n\nThe tutorial's `tensor.add_(5)` is broadcasting too: the scalar 5 is spread over every element. Not knowing this rule easily leads to shapes silently growing (you'll see a real case in the Neural Networks quiz)."
      },
      tryit: `
a = torch.ones(2, 3)
print((a + torch.ones(3)).shape)      # (2, 3)
print((a + torch.ones(2, 1)).shape)   # (2, 3)
try:
    a + torch.ones(2)
except RuntimeError as e:
    print(e)   # The size of tensor a (3) must match the size of tensor b (2) ...
`
    },
    {
      id: "t8", tag: "tutorial",
      topic: { ko: "원소 하나짜리 텐서와 .item()", en: "Single-element tensors and .item()" },
      q: {
        ko: "`agg = tensor.sum()`의 결과는 원소가 하나인 텐서입니다. 다음 코드의 출력은?",
        en: "`agg = tensor.sum()` is a single-element tensor. What does this code print?"
      },
      code: `
tensor = torch.ones(4, 4)
agg = tensor.sum()          # tensor(16.)
agg_item = agg.item()
print(agg_item, type(agg_item))
`,
      options: [
        {
          ok: true,
          t: { ko: "`16.0 <class 'float'>`: 파이썬 기본 숫자", en: "`16.0 <class 'float'>`: a plain Python number" },
          why: {
            ko: "`.item()`은 원소가 하나뿐인 텐서에서 값을 꺼내 파이썬 숫자로 바꿔 줍니다. 학습 루프에서 `running_loss += loss.item()`처럼 로그를 남길 때 자주 써요.",
            en: "`.item()` extracts the value of a one-element tensor as a Python number. You'll use it a lot for logging, e.g. `running_loss += loss.item()`."
          }
        },
        {
          t: "`tensor(16.) <class 'torch.Tensor'>`",
          why: {
            ko: "그건 `agg` 자체입니다. 0차원 텐서도 여전히 텐서예요.",
            en: "That's `agg` itself. A 0-dim tensor is still a tensor."
          }
        },
        {
          t: "`[16.0] <class 'list'>`",
          why: {
            ko: "리스트로 바꾸는 건 `.tolist()`입니다.",
            en: "Converting to a list is `.tolist()`."
          }
        },
        {
          t: "`16.0 <class 'numpy.float32'>`",
          why: {
            ko: "NumPy 값이 아니라 순수 파이썬 `float`입니다. NumPy로 바꾸려면 `.numpy()`를 써야 해요.",
            en: "It's a pure Python `float`, not a NumPy scalar. Use `.numpy()` to get NumPy."
          }
        }
      ],
      explain: {
        ko: "`.item()`은 **원소가 정확히 1개**일 때만 동작합니다. `torch.ones(2).item()`은 `RuntimeError: a Tensor with 2 elements cannot be converted to Scalar`. 원소가 여러 개면 `.tolist()`를 쓰세요.\n\n심화: GPU/MPS 텐서에 `.item()`을 호출하면 값을 CPU로 가져오려고 연산이 끝날 때까지 기다리는 **동기화**가 일어납니다. 매 스텝 남발하면 학습이 느려질 수 있어요.",
        en: "`.item()` works only when there is **exactly one element**: `torch.ones(2).item()` raises `RuntimeError: a Tensor with 2 elements cannot be converted to Scalar`. Use `.tolist()` for many elements.\n\nBonus: calling `.item()` on a GPU/MPS tensor forces a **synchronization**: it waits for the computation to finish so the value can be copied to the CPU. Doing it every step can slow training down."
      },
      tryit: `
agg = torch.ones(4, 4).sum()
print(agg, agg.item(), type(agg.item()))
print(torch.tensor([1.5, 2.5]).tolist())   # [1.5, 2.5]
`
    },
    {
      id: "t9", tag: "tutorial",
      topic: { ko: "In-place 연산", en: "In-place operations" },
      q: {
        ko: "이름 끝에 `_`가 붙은 연산(`add_`, `copy_`, `t_` 등)에 대한 설명으로 옳은 것은?",
        en: "Which statement about operations with a trailing `_` (`add_`, `copy_`, `t_`, …) is correct?"
      },
      options: [
        {
          ok: true,
          t: { ko: "피연산자를 직접 바꾸는 in-place 연산이라, 미분에 문제가 될 수 있어 남용을 권장하지 않는다", en: "In-place ops; they can break autograd, so their use is discouraged" },
          why: {
            ko: "튜토리얼의 Note 그대로입니다. autograd는 역전파 때 순전파의 값을 다시 쓰는데, in-place 연산이 그 값을 덮어쓰면 기울기를 계산할 수 없게 돼요.",
            en: "That's the tutorial's note. Autograd reuses forward-pass values during backprop. If an in-place op overwrites them, the gradient can't be computed."
          }
        },
        {
          t: { ko: "`x.add(5)`도 `x.add_(5)`처럼 `x`를 직접 바꾸며, 둘의 차이는 반환값뿐이다", en: "`x.add(5)` also changes `x` in place; the two differ only in their return value" },
          why: {
            ko: "`_`가 없는 `x.add(5)`는 **새 텐서를 반환**하고 `x`는 그대로입니다. 바꾸려면 `x = x.add(5)`처럼 다시 대입해야 해요.",
            en: "Without `_`, `x.add(5)` **returns a new tensor** and leaves `x` unchanged. You'd have to reassign: `x = x.add(5)`."
          }
        },
        {
          t: { ko: "메모리를 아끼므로 학습 코드에서는 가능한 한 항상 in-place 연산을 쓰는 게 좋다", en: "Since they save memory, training code should use them whenever possible" },
          why: {
            ko: "튜토리얼은 정반대로 '사용을 권장하지 않는다(discouraged)'고 말합니다. 메모리 이득보다 autograd 오류 위험이 더 커요.",
            en: "The tutorial says the opposite: their use is *discouraged*. The autograd risk outweighs the memory savings."
          }
        },
        {
          t: { ko: "`_` 접미사는 파이썬 관례상 외부에서 호출하면 안 되는 private 메서드라는 뜻이다", en: "By Python convention, the `_` suffix marks a private method you shouldn't call" },
          why: {
            ko: "파이썬의 private 관례는 **앞**에 붙는 밑줄(`_method`)입니다. PyTorch에서 **뒤**에 붙는 `_`는 'in-place'를 뜻하는 명명 규칙이에요.",
            en: "Python's private convention is a **leading** underscore (`_method`). In PyTorch, a **trailing** `_` is the naming convention for in-place."
          }
        }
      ],
      explain: {
        ko: "- `x.add_(5)` ≈ `x += 5`: 새 메모리 할당 없이 `x`를 직접 바꿈 (반환값도 `x` 자신)\n- `x.add(5)` ≈ `x + 5`: 새 텐서를 만들고 `x`는 그대로\n\n`requires_grad=True`인 텐서에 in-place 연산을 하면 학습 중 `RuntimeError`가 날 수 있습니다. Neural Networks 퀴즈에서 실제 사례를 볼 수 있어요.",
        en: "- `x.add_(5)` ≈ `x += 5`: modifies `x` directly without new memory (and returns `x` itself)\n- `x.add(5)` ≈ `x + 5`: creates a new tensor; `x` is unchanged\n\nIn-place ops on tensors with `requires_grad=True` can raise a `RuntimeError` during training. You'll see a real case in the Neural Networks quiz."
      },
      tryit: `
x = torch.ones(2)
print(x.add(5), x)    # x unchanged
y = x.add_(5)
print(x, y is x)      # x changed; returns x itself -> True
`
    },
    {
      id: "t10", tag: "tutorial",
      topic: { ko: "NumPy 브리지", en: "Bridge with NumPy" },
      q: {
        ko: "다음 코드의 출력은?",
        en: "What does this code print?"
      },
      code: `
t = torch.ones(5)
n = t.numpy()
t.add_(1)
print(n)
`,
      options: [
        {
          ok: true,
          t: "`[2. 2. 2. 2. 2.]`",
          why: {
            ko: "CPU 텐서와 `.numpy()`로 얻은 배열은 **같은 메모리를 공유**합니다. `t.add_(1)`은 그 메모리를 직접 바꾸므로 `n`에도 그대로 보여요.",
            en: "A CPU tensor and the array from `.numpy()` **share the same memory**. `t.add_(1)` changes that memory in place, so `n` sees it too."
          }
        },
        {
          t: "`[1. 1. 1. 1. 1.]`",
          why: {
            ko: "`.numpy()`가 복사본을 만든다면 이렇게 나오겠지만, 실제로는 메모리를 공유합니다. (단, `t = t + 1`처럼 **새 텐서를 대입**했다면 이 결과가 나와요!)",
            en: "That would happen if `.numpy()` made a copy, but it shares memory. (You *would* get this with `t = t + 1`, which binds `t` to a **new** tensor!)"
          }
        },
        {
          t: "`tensor([2., 2., 2., 2., 2.])`",
          why: {
            ko: "`n`은 텐서가 아니라 NumPy 배열이라 NumPy 형식으로 출력됩니다.",
            en: "`n` is a NumPy array, not a tensor, so it prints in NumPy format."
          }
        },
        {
          t: "`[2 2 2 2 2]`",
          why: {
            ko: "`torch.ones`의 기본 dtype은 `float32`라서 NumPy 배열도 실수(`2.`)로 표시됩니다.",
            en: "`torch.ones` defaults to `float32`, so the NumPy array holds floats and prints `2.`."
          }
        }
      ],
      explain: {
        ko: "**NumPy 브리지**: CPU 위의 텐서와 NumPy 배열은 메모리를 공유할 수 있어서, 한쪽을 in-place로 바꾸면 다른 쪽도 바뀝니다 (`torch.from_numpy(n)` 후 `np.add(n, 1, out=n)`도 마찬가지).\n\n주의: `t = t + 1`은 in-place가 아니라 **새 텐서를 만들어 이름만 다시 붙이는 것**이라 `n`과의 연결이 끊깁니다. 공유되는 건 '변수'가 아니라 '메모리'예요!",
        en: "**NumPy bridge**: CPU tensors and NumPy arrays can share memory, so an in-place change on one shows up in the other (same for `torch.from_numpy(n)` followed by `np.add(n, 1, out=n)`).\n\nCareful: `t = t + 1` is not in-place. It **creates a new tensor and rebinds the name**, breaking the link with `n`. What's shared is the *memory*, not the *variable*!"
      },
      tryit: `
t = torch.ones(5)
n = t.numpy()
t.add_(1)
print(n)   # [2. 2. 2. 2. 2.]
t = t + 1  # new tensor -> link broken
print(n)   # still [2. 2. 2. 2. 2.]
`
    },
    {
      id: "t11", tag: "beyond",
      topic: { ko: "복사 vs 메모리 공유", en: "Copy vs shared memory" },
      q: {
        ko: "다음 코드에서 `a`와 `b`의 값은?",
        en: "What are the values of `a` and `b`?"
      },
      code: `
n = np.ones(3)
a = torch.from_numpy(n)
b = torch.tensor(n)
n += 1          # in-place on the NumPy array
print(a, b)
`,
      options: [
        {
          ok: true,
          t: "`a`: [2., 2., 2.] / `b`: [1., 1., 1.]",
          why: {
            ko: "`torch.from_numpy`는 메모리를 **공유**하고, `torch.tensor`는 데이터를 **항상 복사**합니다. 그래서 `n`의 in-place 변경은 `a`에만 보여요.",
            en: "`torch.from_numpy` **shares** memory, while `torch.tensor` **always copies**. So the in-place change to `n` shows up only in `a`."
          }
        },
        {
          t: "`a`: [2., 2., 2.] / `b`: [2., 2., 2.]",
          why: {
            ko: "`torch.tensor()`는 입력이 무엇이든 새 메모리에 복사본을 만듭니다. 공유하지 않아요.",
            en: "`torch.tensor()` always copies its input into new memory. It never shares."
          }
        },
        {
          t: "`a`: [1., 1., 1.] / `b`: [1., 1., 1.]",
          why: {
            ko: "`from_numpy`는 복사하지 않고 같은 메모리를 바라보므로 `a`는 바뀐 값을 보여 줍니다.",
            en: "`from_numpy` doesn't copy; it views the same memory, so `a` reflects the change."
          }
        },
        {
          t: "`a`: [1., 1., 1.] / `b`: [2., 2., 2.]",
          why: {
            ko: "공유와 복사가 반대로 되었습니다. 공유하는 쪽이 `from_numpy`예요.",
            en: "Shared and copied are reversed here. `from_numpy` is the one that shares."
          }
        }
      ],
      explain: {
        ko: "- `torch.from_numpy(n)` → 공유 (CPU, dtype 유지)\n- `torch.as_tensor(n)` → 가능하면 공유, 불가능하면 복사\n- `torch.tensor(n)` → 항상 복사\n\n원본과 독립적인 데이터가 필요하면 `torch.tensor`, 큰 배열을 복사 비용 없이 쓰고 싶으면 `from_numpy`나 `as_tensor`를 고르세요. 반대 방향인 `.numpy()`도 공유입니다.",
        en: "- `torch.from_numpy(n)` → shares (CPU, keeps dtype)\n- `torch.as_tensor(n)` → shares when possible, otherwise copies\n- `torch.tensor(n)` → always copies\n\nUse `torch.tensor` when you want data independent of the source, and `from_numpy` or `as_tensor` to avoid copying big arrays. The reverse direction, `.numpy()`, also shares."
      },
      tryit: `
import numpy as np
n = np.ones(3)
a = torch.from_numpy(n)
b = torch.tensor(n)
c = torch.as_tensor(n)
n += 1
print(a, b, c)   # a and c changed, b did not
`
    },
    {
      id: "t12", tag: "beyond",
      topic: { ko: "device 이동: .to()", en: "Moving devices: .to()" },
      q: {
        ko: "Apple Silicon Mac(MPS)에서 다음 코드를 실행하면 출력은? (`main.py`의 `mpu_tensor = tensor.to(device)`와 비교해 보세요.)",
        en: "On an Apple Silicon Mac (MPS), what does this print? (Compare with `mpu_tensor = tensor.to(device)` in your `main.py`.)"
      },
      code: `
t = torch.rand(2)
t.to("mps")
print(t.device)
`,
      options: [
        {
          ok: true,
          t: "`cpu`",
          why: {
            ko: "텐서의 `.to()`는 **새 텐서를 반환**할 뿐 원본을 옮기지 않습니다. 반환값을 받지 않았으니 `t`는 여전히 CPU에 있어요. 그래서 `main.py`처럼 `x = t.to(device)`로 받아야 합니다.",
            en: "A tensor's `.to()` **returns a new tensor**; it doesn't move the original. The return value was discarded, so `t` is still on the CPU. That's why you write `x = t.to(device)`, as in your main.py."
          }
        },
        {
          t: "`mps:0`",
          why: {
            ko: "텐서의 `.to()`는 in-place가 아닙니다. (헷갈리는 점: `nn.Module`의 `.to()`는 모델 자체를 옮겨요. 그래서 `net.to(device)`는 대입하지 않아도 동작합니다.)",
            en: "Tensor `.to()` isn't in-place. (Confusingly, `nn.Module.to()` *does* move the module itself, which is why `net.to(device)` works without reassignment.)"
          }
        },
        {
          t: { ko: "에러: CPU 텐서는 mps로 옮길 수 없다", en: "Error: a CPU tensor can't be moved to mps" },
          why: {
            ko: "MPS를 지원하는 Mac이라면 옮기는 것 자체는 정상 동작합니다. 결과를 버렸을 뿐이에요.",
            en: "On a Mac with MPS, moving works fine. The result was simply thrown away."
          }
        },
        {
          t: { ko: "`mps`와 `cpu` 두 곳 모두", en: "Both `mps` and `cpu`" },
          why: {
            ko: "텐서 하나는 항상 하나의 device에만 존재합니다. `.to()`는 다른 device에 **복사본**을 만들 뿐이에요.",
            en: "A tensor lives on exactly one device. `.to()` creates a **copy** on another device."
          }
        }
      ],
      explain: {
        ko: "device 관련 꼭 알아 둘 것:\n- `tensor.to(device)` → 새 텐서 반환 (꼭 대입!)\n- `module.to(device)` → 모듈 자체를 이동 (반환값도 자기 자신)\n- 서로 다른 device의 텐서끼리 연산하면 `Expected all tensors to be on the same device` 에러\n- GPU/MPS 텐서는 `.numpy()` 불가 → `t.cpu().numpy()`\n- `requires_grad=True`인 텐서도 `.numpy()` 불가 → `t.detach().cpu().numpy()`\n- MPS는 `float64`를 지원하지 않음\n\n`torch.accelerator.current_accelerator()`는 지금 쓸 수 있는 가속기(CUDA, MPS 등)를 알려 주고, 없으면 `None`을 돌려줍니다.",
        en: "Device essentials:\n- `tensor.to(device)` → returns a new tensor (always reassign!)\n- `module.to(device)` → moves the module itself (and returns it)\n- Ops between tensors on different devices → `Expected all tensors to be on the same device`\n- GPU/MPS tensors can't call `.numpy()` → `t.cpu().numpy()`\n- Tensors with `requires_grad=True` can't either → `t.detach().cpu().numpy()`\n- MPS doesn't support `float64`\n\n`torch.accelerator.current_accelerator()` tells you which accelerator (CUDA, MPS, …) is available, or returns `None` if there is none."
      },
      tryit: `
device = torch.accelerator.current_accelerator().type   # 'mps' on Apple Silicon
t = torch.rand(2)
t.to(device)
print(t.device)        # cpu
t = t.to(device)
print(t.device)        # mps:0
print(t.cpu().numpy())
`
    }
  ]
});
