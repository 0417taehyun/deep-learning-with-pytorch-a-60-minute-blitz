// Quiz questions for "A Gentle Introduction to torch.autograd".
// Loaded by quiz.html in this folder and by ../main.html (quiz home + mixed practice).
//
// Format: each question has an id (unique across all chapters), tag "tutorial" | "beyond",
// bilingual { ko, en } text, and 4 options with exactly one `ok: true`. Every option has a `why`.
// Optional: `code` (shown under the question), `tryit` (runnable snippet shown after answering).
// Text supports `inline code`, **bold**, "- " bullet lines, and blank-line paragraphs.
(window.QUIZ_CHAPTERS = window.QUIZ_CHAPTERS || []).push({
  id: "autograd",
  dir: "2",
  title: { ko: "torch.autograd 입문", en: "A Gentle Introduction to torch.autograd" },
  summary: { ko: "순전파·역전파, backward()와 기울기, 계산 그래프, 파라미터 동결과 no_grad", en: "Forward & backward passes, backward() and gradients, the computational graph, freezing parameters & no_grad" },
  source: "https://docs.pytorch.org/tutorials/beginner/blitz/autograd_tutorial.html",
  questions: [
    {
      id: "a1", tag: "tutorial",
      topic: { ko: "순전파와 역전파", en: "Forward and backward propagation" },
      q: {
        ko: "신경망 학습의 두 단계 중 **역전파(backward propagation)**에 대한 설명으로 옳은 것은?",
        en: "Of the two steps of training a neural network, which correctly describes **backward propagation**?"
      },
      options: [
        {
          ok: true,
          t: { ko: "출력에서 거꾸로 가며 각 파라미터의 기울기를 구하고, 경사하강법으로 파라미터를 조정한다", en: "It goes backwards from the output, computing each parameter's gradient, then adjusts them via gradient descent" },
          why: {
            ko: "튜토리얼의 정의 그대로입니다. 연쇄 법칙(chain rule)으로 출력에서 입력 방향으로 기울기를 전파해요.",
            en: "That's the tutorial's definition. Gradients flow from the output toward the input via the chain rule."
          }
        },
        {
          t: { ko: "입력 데이터를 첫 층부터 마지막 층까지 차례로 통과시켜 정답에 대한 '최선의 추측'(예측값)을 만든다", en: "It runs the input through every layer, first to last, to produce its best guess (the prediction) of the correct output" },
          why: {
            ko: "이건 **순전파(forward propagation)**에 대한 설명입니다.",
            en: "That describes **forward** propagation."
          }
        },
        {
          t: { ko: "오차가 일정 기준보다 크면 해당 층의 가중치를 무작위 값으로 다시 초기화해 새로 시작한다", en: "When the error exceeds a threshold, it re-initializes that layer's weights randomly and starts over" },
          why: {
            ko: "가중치는 기울기의 반대 방향으로 **조금씩** 조정될 뿐, 다시 초기화되지 않습니다.",
            en: "Weights are nudged a little against the gradient. They're never re-initialized."
          }
        },
        {
          t: { ko: "예측값과 정답을 비교해 손실(loss) 값 하나만 계산하고, 파라미터는 건드리지 않는다", en: "It compares the prediction with the target to compute a single loss value, and never touches the parameters" },
          why: {
            ko: "손실 계산은 순전파의 마지막 단계입니다. 역전파의 목적은 손실을 줄이도록 파라미터를 고칠 기울기를 구하는 거예요.",
            en: "Computing the loss is the last step of the forward pass. Backprop's whole point is computing the gradients used to fix the parameters."
          }
        }
      ],
      explain: {
        ko: "신경망 = 가중치와 편향(파라미터)을 가진 함수들의 중첩.\n- **순전파**: 입력 → 예측값 → 손실\n- **역전파**: 손실 → (연쇄 법칙) → 각 파라미터의 기울기 ∂loss/∂w\n- **갱신**: w ← w − lr × ∂loss/∂w\n\nautograd는 이 중 역전파를 자동으로 해 주는 엔진입니다.",
        en: "A neural network = nested functions with parameters (weights and biases).\n- **Forward**: input → prediction → loss\n- **Backward**: loss → (chain rule) → each parameter's gradient ∂loss/∂w\n- **Update**: w ← w − lr × ∂loss/∂w\n\nautograd is the engine that does the backward step for you."
      }
    },
    {
      id: "a2", tag: "tutorial",
      topic: { ko: "backward()와 step()의 역할", en: "Roles of backward() and step()" },
      q: {
        ko: "튜토리얼의 학습 단계 코드에서 `loss.backward()`와 `optim.step()`의 역할을 바르게 짝지은 것은?",
        en: "In the tutorial's training step, which correctly pairs the roles of `loss.backward()` and `optim.step()`?"
      },
      code: `
prediction = model(data)                 # forward pass
loss = (prediction - labels).sum()
loss.backward()                          # (1)
optim = torch.optim.SGD(model.parameters(), lr=1e-2, momentum=0.9)
optim.step()                             # (2)
`,
      options: [
        {
          ok: true,
          t: { ko: "(1) 기울기를 계산해 `.grad`에 저장 / (2) `.grad`로 파라미터 값을 갱신", en: "(1) computes gradients into each `.grad` / (2) updates parameters using `.grad`" },
          why: {
            ko: "`backward()`는 값을 바꾸지 않고 기울기만 채웁니다. 실제 가중치 변경은 옵티마이저의 `step()`이 해요.",
            en: "`backward()` only fills in gradients without changing any values. The optimizer's `step()` actually changes the weights."
          }
        },
        {
          t: { ko: "(1) 기울기 방향으로 파라미터 값을 갱신 / (2) 다음 스텝을 위해 기울기를 계산해 저장", en: "(1) updates parameter values along the gradient / (2) computes and stores gradients for the next step" },
          why: {
            ko: "역할이 서로 바뀌었습니다.",
            en: "The roles are swapped."
          }
        },
        {
          t: { ko: "(1) 이전 스텝의 기울기를 0으로 초기화 / (2) DataLoader에서 다음 배치를 불러옴", en: "(1) resets the previous step's gradients to zero / (2) loads the next batch from the DataLoader" },
          why: {
            ko: "기울기 초기화는 `optimizer.zero_grad()`가 하고, 다음 배치는 `for data in trainloader` 루프가 꺼내 옵니다. `backward()`와 `step()`은 그런 일을 하지 않아요.",
            en: "Zeroing gradients is `optimizer.zero_grad()`'s job, and the next batch comes from your `for data in trainloader` loop. `backward()` and `step()` do neither."
          }
        },
        {
          t: { ko: "둘 다 기울기 계산과 갱신을 함께 하므로, 둘 중 하나만 호출해도 된다", en: "Both compute gradients and update weights, so calling either one is enough" },
          why: {
            ko: "`backward()`만 하면 기울기만 쌓이고 가중치는 그대로입니다. `step()`만 하면 `.grad`가 `None`이라 아무것도 갱신되지 않아요.",
            en: "With only `backward()`, gradients pile up but the weights never change. With only `step()`, `.grad` is `None`, so nothing gets updated."
          }
        }
      ],
      explain: {
        ko: "역할 분담:\n- **autograd** (`loss.backward()`): 각 파라미터를 *얼마나* 바꿔야 하는지 = 기울기 계산\n- **optimizer** (`optim.step()`): SGD, Adam 같은 규칙에 따라 *실제로* 바꾸기\n\n옵티마이저는 만들 때 `model.parameters()`를 넘겨받았으므로 어떤 텐서를 갱신할지 이미 알고 있어요. 이 예제의 `lr=1e-2`는 0.01이고, `momentum=0.9`는 이전 이동 방향을 90% 유지해 관성을 주는 설정입니다.",
        en: "Division of labor:\n- **autograd** (`loss.backward()`): *how much* each parameter should change = gradients\n- **optimizer** (`optim.step()`): *actually* changes them by a rule (SGD, Adam, …)\n\nThe optimizer received `model.parameters()` when created, so it already knows which tensors to update. In this example `lr=1e-2` is 0.01, and `momentum=0.9` keeps 90% of the previous update direction as inertia."
      }
    },
    {
      id: "a3", tag: "tutorial",
      topic: { ko: "autograd로 미분하기", en: "Differentiation in autograd" },
      q: {
        ko: "다음 코드 실행 후 `a.grad`의 값은?",
        en: "After running this code, what is `a.grad`?"
      },
      code: `
a = torch.tensor([2., 3.], requires_grad=True)
b = torch.tensor([6., 4.], requires_grad=True)
Q = 3*a**3 - b**2
Q.backward(gradient=torch.tensor([1., 1.]))
print(a.grad)
`,
      options: [
        {
          ok: true,
          t: "`tensor([36., 81.])`",
          why: {
            ko: "∂Q/∂a = 9a² 이므로 a = [2, 3]에서 [9×4, 9×9] = [36, 81]입니다. 3a³을 미분하면 3 × 3a² = 9a²예요.",
            en: "∂Q/∂a = 9a², so at a = [2, 3] it's [9×4, 9×9] = [36, 81]. Differentiating 3a³ gives 3 × 3a² = 9a²."
          }
        },
        {
          t: "`tensor([12., 27.])`",
          why: {
            ko: "3a²로 계산한 값입니다. 앞의 계수 3을 빼먹었어요: d(3a³)/da = 9a².",
            en: "That's 3a²: the leading coefficient 3 was dropped. d(3a³)/da = 9a²."
          }
        },
        {
          t: "`tensor([-12., -8.])`",
          why: {
            ko: "이건 `b.grad`(∂Q/∂b = −2b)입니다.",
            en: "That's `b.grad` (∂Q/∂b = −2b)."
          }
        },
        {
          t: "`None`",
          why: {
            ko: "`a`는 `requires_grad=True`인 **리프 텐서**라서 `backward()` 후 `.grad`가 채워집니다.",
            en: "`a` is a **leaf** tensor with `requires_grad=True`, so its `.grad` is filled in after `backward()`."
          }
        }
      ],
      explain: {
        ko: "Q = 3a³ − b² 를 각각 편미분하면:\n- ∂Q/∂a = 9a² → [36, 81]\n- ∂Q/∂b = −2b → [−12, −8]\n\nautograd가 계산한 `a.grad`, `b.grad`가 손으로 계산한 값과 정확히 일치합니다. 튜토리얼처럼 `print(9*a**2 == a.grad)`로 확인해 보세요.",
        en: "Partial derivatives of Q = 3a³ − b²:\n- ∂Q/∂a = 9a² → [36, 81]\n- ∂Q/∂b = −2b → [−12, −8]\n\nautograd's `a.grad` and `b.grad` match the hand-computed values exactly. Check it like the tutorial does: `print(9*a**2 == a.grad)`."
      },
      tryit: `
a = torch.tensor([2., 3.], requires_grad=True)
b = torch.tensor([6., 4.], requires_grad=True)
Q = 3*a**3 - b**2
Q.backward(gradient=torch.tensor([1., 1.]))
print(a.grad, 9*a**2 == a.grad)    # tensor([36., 81.]) tensor([True, True])
print(b.grad, -2*b == b.grad)      # tensor([-12., -8.]) tensor([True, True])
`
    },
    {
      id: "a4", tag: "tutorial",
      topic: { ko: "backward()의 gradient 인자", en: "The gradient argument of backward()" },
      q: {
        ko: "앞 문제에서 `Q.backward()`를 인자 없이 호출하면 `RuntimeError: grad can be implicitly created only for scalar outputs`가 납니다. `gradient=torch.tensor([1., 1.])`가 필요한 이유는?",
        en: "In the previous example, calling `Q.backward()` without arguments raises `RuntimeError: grad can be implicitly created only for scalar outputs`. Why is `gradient=torch.tensor([1., 1.])` needed?"
      },
      options: [
        {
          ok: true,
          t: { ko: "`Q`가 스칼라가 아닌 벡터라서, 출력 쪽 기울기 벡터 v를 직접 줘야 하기 때문", en: "`Q` is a vector, not a scalar, so the output-side gradient v must be given" },
          why: {
            ko: "스칼라 손실이면 ∂loss/∂loss = 1이 자명하지만, 벡터 출력은 무엇을 기준으로 미분할지 정해지지 않습니다. `[1., 1.]`을 주는 것은 `Q.sum().backward()`와 같아요.",
            en: "For a scalar loss, ∂loss/∂loss = 1 is implied, but for a vector output the starting point is ambiguous. Passing `[1., 1.]` is equivalent to `Q.sum().backward()`."
          }
        },
        {
          t: { ko: "`a`와 `b` 중 어떤 텐서에 대해 미분할지 지정하는 인자이기 때문", en: "It specifies which tensor, `a` or `b`, to differentiate with respect to" },
          why: {
            ko: "`backward()`는 `requires_grad=True`인 **모든** 리프 텐서의 기울기를 한꺼번에 구합니다. `gradient`는 출력 쪽에 대한 벡터예요.",
            en: "`backward()` computes gradients for **all** leaf tensors with `requires_grad=True` at once. `gradient` is about the output side."
          }
        },
        {
          t: { ko: "역전파 때 기울기에 곱할 학습률(learning rate)을 지정하는 인자이기 때문", en: "It sets the learning rate that gradients are multiplied by during backprop" },
          why: {
            ko: "학습률은 옵티마이저의 인자입니다. `backward()`는 기울기만 계산할 뿐 갱신하지 않아요.",
            en: "The learning rate belongs to the optimizer. `backward()` only computes gradients; it never updates anything."
          }
        },
        {
          t: { ko: "`a`, `b`에 `requires_grad=True`가 빠져 있기 때문", en: "Because `a` and `b` are missing `requires_grad=True`" },
          why: {
            ko: "`a`, `b` 모두 `requires_grad=True`로 만들었습니다. 에러 메시지도 출력이 스칼라가 아니라는 내용이에요.",
            en: "Both `a` and `b` were created with `requires_grad=True`, and the error message is about the output not being a scalar."
          }
        }
      ],
      explain: {
        ko: "`backward()`는 '출력에 대한 기울기'에서 출발합니다.\n- 출력이 스칼라 → 출발값은 1 (생략 가능)\n- 출력이 벡터 → 출발 벡터 v를 직접 넘겨야 함\n\n실제 학습에서는 손실을 `mean()`이나 `sum()`으로 스칼라로 만든 뒤 `loss.backward()`를 호출하므로, 이 인자를 쓸 일은 거의 없어요.",
        en: "`backward()` starts from 'the gradient of the output'.\n- Scalar output → starts from 1 (can be omitted)\n- Vector output → you must pass the starting vector v\n\nIn real training, the loss is reduced to a scalar with `mean()` or `sum()` before `loss.backward()`, so you'll rarely pass this argument."
      },
      tryit: `
a = torch.tensor([2., 3.], requires_grad=True)
Q = 3*a**3
Q.sum().backward()      # same as Q.backward(gradient=torch.ones(2))
print(a.grad)           # tensor([36., 81.])
`
    },
    {
      id: "a5", tag: "tutorial",
      topic: { ko: "벡터-야코비안 곱", en: "Vector-Jacobian product" },
      q: {
        ko: "튜토리얼의 'Vector Calculus' 부분에 따르면, `torch.autograd`가 실제로 계산하는 것은 무엇일까요?",
        en: "According to the tutorial's 'Vector Calculus' section, what does `torch.autograd` actually compute?"
      },
      options: [
        {
          ok: true,
          t: { ko: "야코비안 행렬 J와 벡터 v의 벡터-야코비안 곱 Jᵀ·v", en: "The vector-Jacobian product Jᵀ·v of the Jacobian J and a vector v" },
          why: {
            ko: "autograd는 전체 야코비안을 만들지 않고, `backward(gradient=v)`로 받은 v에 대해 Jᵀ·v를 바로 계산합니다. v가 스칼라 손실 l의 기울기 ∂l/∂y라면, 연쇄 법칙에 의해 결과는 ∂l/∂x가 돼요.",
            en: "autograd never builds the full Jacobian. Given v from `backward(gradient=v)`, it computes Jᵀ·v directly. If v is the gradient ∂l/∂y of a scalar loss l, the chain rule makes the result ∂l/∂x."
          }
        },
        {
          t: { ko: "전체 야코비안 행렬을 메모리에 만든 뒤 사용자에게 돌려준다", en: "It builds the full Jacobian matrix in memory and returns it" },
          why: {
            ko: "파라미터가 수백만 개면 야코비안은 수백만 × 수백만 크기라 비현실적입니다. 그래서 VJP만 계산해요. (전체 야코비안이 꼭 필요하면 `torch.autograd.functional.jacobian`이 따로 있습니다.)",
            en: "With millions of parameters, the Jacobian would be millions × millions, which is infeasible. Hence VJPs. (If you really need the full Jacobian, there's `torch.autograd.functional.jacobian`.)"
          }
        },
        {
          t: { ko: "입력을 아주 조금 바꿔 보며 출력 변화를 재는 수치 미분(finite difference)", en: "Numerical differentiation (finite differences): nudge the inputs and measure the output change" },
          why: {
            ko: "수치 미분은 느리고 오차가 있습니다. autograd는 연산마다 정확한 미분 공식을 적용하는 **자동 미분(reverse-mode)**이에요.",
            en: "Finite differences are slow and imprecise. autograd is **reverse-mode automatic differentiation**, which applies the exact derivative rule of each operation."
          }
        },
        {
          t: { ko: "SymPy처럼 수식 전체를 기호적으로 미분해 새 수식을 만든다", en: "Symbolic differentiation of the whole formula, like SymPy" },
          why: {
            ko: "autograd는 수식을 다루지 않고, 실제로 실행된 연산 기록(그래프)을 따라가며 **숫자 값**으로 기울기를 계산합니다.",
            en: "autograd doesn't manipulate formulas. It follows the record (graph) of operations that actually ran and computes **numeric** gradient values."
          }
        }
      ],
      explain: {
        ko: "y = f(x)에서 x, y가 벡터일 때 야코비안 J의 (i, j) 원소는 ∂yᵢ/∂xⱼ입니다. autograd는 Jᵀ·v만 계산하는데, 손실 l이 항상 스칼라이기 때문에 이것으로 충분해요:\n\nJᵀ · (∂l/∂y) = ∂l/∂x (연쇄 법칙)\n\n각 층이 '들어온 v에 자기 야코비안을 곱해 다음 층으로 넘기는' 과정을 반복하는 것이 바로 역전파입니다.",
        en: "For y = f(x) with vectors x and y, the Jacobian J has entries ∂yᵢ/∂xⱼ. autograd only computes Jᵀ·v, which is enough because the loss l is always a scalar:\n\nJᵀ · (∂l/∂y) = ∂l/∂x (chain rule)\n\nBackprop is just each layer multiplying the incoming v by its own Jacobian and passing the result on."
      }
    },
    {
      id: "a6", tag: "tutorial",
      topic: { ko: "계산 그래프 (DAG)", en: "Computational graph (DAG)" },
      q: {
        ko: "autograd의 계산 그래프(DAG)에 대한 설명으로 옳은 것은?",
        en: "Which statement about autograd's computational graph (DAG) is correct?"
      },
      options: [
        {
          ok: true,
          t: { ko: "그래프는 `.backward()` 후 버려지고 다음 순전파 때 처음부터 새로 만들어진다", en: "The graph is discarded after `.backward()` and rebuilt from scratch on the next forward pass" },
          why: {
            ko: "PyTorch의 그래프는 **동적(dynamic)**입니다. 그래서 forward 안에서 `if`, `for` 같은 파이썬 제어문을 자유롭게 쓰고, 반복마다 shape이나 연산을 바꿀 수 있어요.",
            en: "PyTorch graphs are **dynamic**, so you can freely use Python control flow (`if`, `for`) inside forward and change shapes or operations every iteration."
          }
        },
        {
          t: { ko: "그래프는 프로그램 시작 시 한 번만 만들어지고, 이후에는 같은 그래프를 재사용해 속도를 높인다", en: "The graph is built once at program start, then reused for every iteration to save time" },
          why: {
            ko: "이건 예전 TensorFlow 1.x 같은 **정적 그래프** 방식입니다. PyTorch는 매 반복 새로 만들어요.",
            en: "That's the **static graph** style of, e.g., old TensorFlow 1.x. PyTorch rebuilds the graph every iteration."
          }
        },
        {
          t: { ko: "사용자가 직접 만든 텐서 `a`에도 어떤 연산으로 만들어졌는지 기록하는 `.grad_fn`이 있다", en: "A tensor `a` you created directly also has a `.grad_fn` recording the operation that created it" },
          why: {
            ko: "직접 만든 리프 텐서의 `grad_fn`은 `None`입니다. `grad_fn`은 `a * 3`처럼 **연산의 결과**인 텐서에만 생겨요 (예: `MulBackward0`).",
            en: "A leaf tensor you created has `grad_fn = None`. Only tensors that are **results of operations**, like `a * 3`, get one (e.g. `MulBackward0`)."
          }
        },
        {
          t: { ko: "역전파는 잎(입력·파라미터)에서 시작해 뿌리(출력) 방향으로 기울기를 전파한다", en: "Backprop starts at the leaves (inputs/parameters) and propagates gradients toward the root (output)" },
          why: {
            ko: "반대입니다. 역전파는 뿌리(출력, 보통 loss)에서 시작해 잎(입력·파라미터) 방향으로 기울기를 전파해요.",
            en: "It's the opposite. Backprop starts at the root (the output, usually the loss) and flows toward the leaves (inputs and parameters)."
          }
        }
      ],
      explain: {
        ko: "- **순전파**: 연산을 실행하면서 각 연산의 기울기 함수(`grad_fn`)를 그래프에 기록\n- **역전파** (`.backward()`): 뿌리에서 출발해 각 `grad_fn`으로 기울기 계산 → 각 텐서의 `.grad`에 누적 → 연쇄 법칙으로 잎까지 전파\n\n그래프는 Function 객체들로 이루어진 방향성 비순환 그래프(DAG)입니다.",
        en: "- **Forward**: runs each operation and records its gradient function (`grad_fn`) in the graph\n- **Backward** (`.backward()`): starts at the root, computes gradients via each `grad_fn` → accumulates them into `.grad` → propagates to the leaves by the chain rule\n\nThe graph is a directed acyclic graph (DAG) of Function objects."
      },
      tryit: `
a = torch.tensor(2., requires_grad=True)
b = a * 3
print(a.is_leaf, a.grad_fn)   # True None
print(b.is_leaf, b.grad_fn)   # False <MulBackward0 ...>
`
    },
    {
      id: "a7", tag: "beyond",
      topic: { ko: "기울기 누적", en: "Gradient accumulation" },
      q: {
        ko: "다음 코드의 출력은?",
        en: "What does this code print?"
      },
      code: `
x = torch.tensor(2., requires_grad=True)
y = x ** 2
y.backward()
y = x ** 2      # build a new graph
y.backward()
print(x.grad)
`,
      options: [
        {
          ok: true,
          t: "`tensor(8.)`",
          why: {
            ko: "dy/dx = 2x = 4입니다. `.backward()`는 기울기를 `.grad`에 **덮어쓰지 않고 더하므로(누적)**, 두 번 호출하면 4 + 4 = 8이에요.",
            en: "dy/dx = 2x = 4. `.backward()` **adds** to `.grad` instead of overwriting it, so after two calls it's 4 + 4 = 8."
          }
        },
        {
          t: "`tensor(4.)`",
          why: {
            ko: "기울기가 덮어써진다면 4겠지만, PyTorch는 기울기를 누적합니다.",
            en: "4 would be right if gradients were overwritten, but PyTorch accumulates them."
          }
        },
        {
          t: "`tensor(16.)`",
          why: {
            ko: "기울기는 곱해지는 것이 아니라 더해집니다.",
            en: "Gradients are summed, not multiplied."
          }
        },
        {
          t: "RuntimeError",
          why: {
            ko: "두 번째 `y = x ** 2`에서 그래프를 **새로 만들었기 때문에** 에러가 나지 않습니다. 같은 그래프로 `backward()`를 두 번 하는 경우는 다음 문제에서 다뤄요.",
            en: "The second `y = x ** 2` **builds a fresh graph**, so there's no error. Calling `backward()` twice on the *same* graph is the next question."
          }
        }
      ],
      explain: {
        ko: "PyTorch는 기울기를 **누적**합니다. 그래서 학습 루프에서는 매 반복 `optimizer.zero_grad()`로 기울기를 비워야 해요. 그러지 않으면 이전 배치의 기울기가 계속 더해져 엉뚱한 방향으로 갱신됩니다.\n\n왜 이렇게 설계했을까요? 메모리가 부족할 때 작은 배치 여러 개의 기울기를 모아 큰 배치처럼 학습하는 **gradient accumulation** 기법을 쉽게 쓰기 위해서예요.",
        en: "PyTorch **accumulates** gradients. That's why training loops call `optimizer.zero_grad()` every iteration. Otherwise, gradients from previous batches keep adding up and the update goes the wrong way.\n\nWhy this design? It makes **gradient accumulation** easy: summing the gradients of several small batches to emulate one big batch when memory is tight."
      },
      tryit: `
x = torch.tensor(2., requires_grad=True)
for step in range(3):
    y = x ** 2
    y.backward()
    print(step, x.grad)    # 4, 8, 12: accumulating!
x.grad = None              # what zero_grad() does by default
`
    },
    {
      id: "a8", tag: "beyond",
      topic: { ko: "같은 그래프로 두 번 backward", en: "Calling backward twice on one graph" },
      q: {
        ko: "같은 `y`에 대해 `backward()`를 두 번 호출하면 어떻게 될까요?",
        en: "What happens if you call `backward()` twice on the same `y`?"
      },
      code: `
x = torch.tensor(2., requires_grad=True)
y = x ** 2
y.backward()
y.backward()    # same graph again
`,
      options: [
        {
          ok: true,
          t: { ko: "RuntimeError (첫 `backward()` 때 중간 값이 해제됨)", en: "RuntimeError (the first `backward()` freed saved values)" },
          why: {
            ko: "실제 메시지: `Trying to backward through the graph a second time (or directly access saved tensors after they have already been freed)`. 메모리를 아끼려고 역전파가 끝나면 그래프 버퍼를 바로 해제해요.",
            en: "Actual message: `Trying to backward through the graph a second time (or directly access saved tensors after they have already been freed)`. Graph buffers are freed right after backprop to save memory."
          }
        },
        {
          t: { ko: "정상 동작하고, 기울기가 누적되어 `x.grad`는 8이 된다", en: "It works, and gradients accumulate so `x.grad` becomes 8" },
          why: {
            ko: "첫 호출을 `y.backward(retain_graph=True)`로 했다면 이렇게 됩니다. 기본 설정에서는 그래프가 해제돼요.",
            en: "That's what happens if the first call is `y.backward(retain_graph=True)`. By default, the graph is freed."
          }
        },
        {
          t: { ko: "정상 동작하지만 두 번째 호출은 무시되어 `x.grad`는 4로 남는다", en: "It works; the second call is ignored and `x.grad` stays 4" },
          why: {
            ko: "PyTorch는 조용히 무시하지 않고 명확한 에러를 냅니다.",
            en: "PyTorch doesn't silently ignore it. It raises a clear error."
          }
        },
        {
          t: { ko: "두 번째 호출이 이전 기울기를 지워서 `x.grad`가 0으로 초기화된다", en: "The second call clears the old gradient, resetting `x.grad` to 0" },
          why: {
            ko: "`backward()`는 절대 기울기를 0으로 만들지 않습니다. 초기화는 `zero_grad()`의 몫이에요.",
            en: "`backward()` never zeroes gradients. That's `zero_grad()`'s job."
          }
        }
      ],
      explain: {
        ko: "튜토리얼의 '그래프는 `.backward()` 호출 후 처음부터 다시 만들어진다'는 말의 실제 의미입니다. 순전파를 다시 하면(새 그래프) 다시 `backward()`할 수 있어요.\n\n같은 그래프로 여러 번 역전파해야 하는 특수한 경우에만 `retain_graph=True`를 쓰세요 (메모리를 더 씁니다).",
        en: "This is what the tutorial means by 'the graph is recreated from scratch after each `.backward()` call'. Run the forward pass again (new graph) and you can call `backward()` again.\n\nUse `retain_graph=True` only in the special case where you must backprop through the same graph multiple times (it costs memory)."
      },
      tryit: `
x = torch.tensor(2., requires_grad=True)
y = x ** 2
y.backward(retain_graph=True)
y.backward()
print(x.grad)   # tensor(8.)
`
    },
    {
      id: "a9", tag: "tutorial",
      topic: { ko: "requires_grad의 전파", en: "How requires_grad propagates" },
      q: {
        ko: "다음 코드의 출력은?",
        en: "What does this code print?"
      },
      code: `
x = torch.rand(5, 5)
y = torch.rand(5, 5)
z = torch.rand((5, 5), requires_grad=True)
a = x + y
b = x + z
print(a.requires_grad, b.requires_grad)
`,
      options: [
        {
          ok: true,
          t: "`False True`",
          why: {
            ko: "연산의 입력 중 **하나라도** `requires_grad=True`이면 출력도 기울기를 추적합니다. `a`는 입력이 모두 False라 False, `b`는 `z` 덕분에 True예요.",
            en: "If **any** input of an operation requires grad, so does the output. `a`'s inputs are both False → False, and `b` gets True from `z`."
          }
        },
        {
          t: "`False False`",
          why: {
            ko: "`b`의 입력 `z`가 `requires_grad=True`이므로 출력에도 전파됩니다.",
            en: "`b`'s input `z` requires grad, so it propagates to the output."
          }
        },
        {
          t: "`True True`",
          why: {
            ko: "`torch.rand`로 만든 텐서는 기본적으로 `requires_grad=False`입니다. 모든 텐서를 추적하지는 않아요.",
            en: "Tensors from `torch.rand` default to `requires_grad=False`. Not everything is tracked."
          }
        },
        {
          t: { ko: "`False`를 출력한 뒤, `b` 계산에서 에러 (requires_grad가 다른 텐서끼리는 더할 수 없음)", en: "Prints `False`, then errors on `b` (tensors with different requires_grad can't be added)" },
          why: {
            ko: "섞어서 연산하는 건 아주 흔하고 정상입니다. 입력 데이터(False)와 학습 파라미터(True)가 만나는 게 바로 신경망이에요.",
            en: "Mixing them is common and perfectly fine. That's exactly what a neural network does: input data (False) meets learnable parameters (True)."
          }
        }
      ],
      explain: {
        ko: "autograd는 `requires_grad=True`인 텐서가 관여한 연산만 추적합니다. 입력 데이터(이미지 등)는 보통 False, 모델 파라미터는 True라서 둘이 만나는 지점부터 그래프가 기록돼요.\n\n기울기를 계산하지 않는 파라미터를 **frozen parameter**라고 하며, 기울기 계산을 생략하므로 연산량이 줄어듭니다.",
        en: "autograd only tracks operations involving a `requires_grad=True` tensor. Input data (images, …) usually has False and model parameters have True, so recording starts where they meet.\n\nParameters that don't compute gradients are called **frozen parameters**. Skipping their gradients saves computation."
      }
    },
    {
      id: "a10", tag: "tutorial",
      topic: { ko: "파인튜닝과 파라미터 동결", en: "Finetuning and freezing parameters" },
      q: {
        ko: "이 코드로 학습하면 실제로 값이 갱신되는 파라미터는?",
        en: "When training with this code, which parameters actually get updated?"
      },
      code: `
model = resnet18(weights=ResNet18_Weights.DEFAULT)
for param in model.parameters():
    param.requires_grad = False

model.fc = nn.Linear(512, 10)
optimizer = optim.SGD(model.parameters(), lr=1e-2, momentum=0.9)
`,
      options: [
        {
          ok: true,
          t: { ko: "새로 만든 `model.fc`의 weight와 bias만", en: "Only the new `model.fc`'s weight and bias" },
          why: {
            ko: "동결은 교체 **전에** 했고, 새로 만든 `nn.Linear`의 파라미터는 기본값이 `requires_grad=True`입니다. 옵티마이저에 모든 파라미터를 넘겨도, 기울기가 없는(`None`) 파라미터는 갱신되지 않아요.",
            en: "The freeze happened **before** the replacement, and a newly created `nn.Linear` has `requires_grad=True` by default. Even though every parameter is passed to the optimizer, those without gradients (`None`) aren't updated."
          }
        },
        {
          t: { ko: "아무것도 갱신되지 않는다 (모든 파라미터를 동결했으므로)", en: "Nothing (all parameters were frozen)" },
          why: {
            ko: "동결 루프는 그 시점에 존재하던 파라미터에만 적용됩니다. 그 뒤에 새로 만든 `fc`는 영향을 받지 않아요.",
            en: "The loop only froze the parameters that existed at that moment. The `fc` created afterwards is unaffected."
          }
        },
        {
          t: { ko: "모든 파라미터 (옵티마이저에 `model.parameters()` 전체를 넘겼으므로)", en: "All parameters (the optimizer received all of `model.parameters()`)" },
          why: {
            ko: "옵티마이저는 `.grad`가 있는 파라미터만 갱신합니다. 동결된 파라미터는 `.grad`가 계속 `None`이에요.",
            en: "The optimizer only updates parameters that have a `.grad`. Frozen ones keep `.grad = None`."
          }
        },
        {
          t: { ko: "`fc`의 weight만 (bias는 동결된 상태)", en: "Only `fc.weight` (the bias stays frozen)" },
          why: {
            ko: "새 `nn.Linear`의 weight와 bias는 둘 다 `requires_grad=True`로 만들어집니다.",
            en: "Both the weight and the bias of a new `nn.Linear` are created with `requires_grad=True`."
          }
        }
      ],
      explain: {
        ko: "**파인튜닝(finetuning)** 패턴: 사전학습 모델의 특징 추출 부분은 동결하고, 새 분류층(여기선 10클래스)만 학습합니다. 적은 데이터와 연산으로도 좋은 성능을 낼 수 있어요.\n\n`[n for n, p in model.named_parameters() if p.requires_grad]`로 확인하면 `['fc.weight', 'fc.bias']`만 나옵니다.\n\n같은 '기록 제외' 효과를 코드 블록 단위로 내는 방법이 `torch.no_grad()` 컨텍스트 매니저예요.",
        en: "The **finetuning** pattern: freeze the pretrained feature extractor and train only the new classifier (10 classes here). You get good results with little data and compute.\n\nCheck with `[n for n, p in model.named_parameters() if p.requires_grad]` → only `['fc.weight', 'fc.bias']`.\n\nThe same exclusion for a whole block of code is available as the `torch.no_grad()` context manager."
      },
      tryit: `
import torch.nn as nn
from torchvision.models import resnet18
model = resnet18(weights=None)   # no download needed for this check
for p in model.parameters():
    p.requires_grad = False
model.fc = nn.Linear(512, 10)
print([n for n, p in model.named_parameters() if p.requires_grad])
`
    },
    {
      id: "a11", tag: "beyond",
      topic: { ko: "리프 텐서와 .grad", en: "Leaf tensors and .grad" },
      q: {
        ko: "다음 코드의 출력은?",
        en: "What does this code print?"
      },
      code: `
a = torch.tensor(2., requires_grad=True)
b = a * 3
c = b ** 2
c.backward()
print(a.grad, b.grad)
`,
      options: [
        {
          ok: true,
          t: "`tensor(36.) None`",
          why: {
            ko: "dc/da = dc/db × db/da = 2b × 3 = 2×6×3 = 36입니다. 하지만 `.grad`는 기본적으로 **리프 텐서에만** 저장되므로, 중간 결과인 `b`의 `.grad`는 `None`이에요 (경고도 함께 출력됩니다).",
            en: "dc/da = dc/db × db/da = 2b × 3 = 2×6×3 = 36. But `.grad` is only kept for **leaf tensors** by default, so the intermediate `b` has `.grad = None` (and a warning is printed)."
          }
        },
        {
          t: "`tensor(36.) tensor(12.)`",
          why: {
            ko: "dc/db = 2b = 12라는 계산은 맞지만, 중간 텐서의 기울기는 메모리 절약을 위해 저장되지 않습니다. 저장하려면 `backward()` 전에 `b.retain_grad()`를 호출해야 해요.",
            en: "dc/db = 2b = 12 is correct math, but intermediate gradients aren't stored, to save memory. Call `b.retain_grad()` before `backward()` to keep it."
          }
        },
        {
          t: "`tensor(12.) tensor(36.)`",
          why: {
            ko: "두 값이 뒤바뀌었고, 애초에 `b.grad`는 저장되지 않습니다.",
            en: "The values are swapped, and `b.grad` isn't stored anyway."
          }
        },
        {
          t: "`tensor(6.) None`",
          why: {
            ko: "연쇄 법칙을 끝까지 적용해야 합니다: 2b × 3 = 36. 6은 `b`의 값이에요.",
            en: "Apply the chain rule all the way: 2b × 3 = 36. 6 is the value of `b`."
          }
        }
      ],
      explain: {
        ko: "- **리프 텐서**: 사용자가 직접 만든 텐서 (모델 파라미터 포함) → `.grad`가 채워짐\n- **비리프 텐서**: 연산의 결과 (`grad_fn`이 있음) → 기울기는 역전파 도중에만 쓰이고 버려짐\n\n갱신할 대상은 파라미터(리프)뿐이니 합리적인 설계예요. 디버깅 중 중간 값의 기울기를 보고 싶다면 `retain_grad()`를 쓰세요.",
        en: "- **Leaf tensors**: created directly by you (including model parameters) → `.grad` is populated\n- **Non-leaf tensors**: results of operations (they have a `grad_fn`) → their gradients are used during backprop, then discarded\n\nThis makes sense, since only parameters (leaves) get updated. Use `retain_grad()` to inspect an intermediate gradient when debugging."
      },
      tryit: `
a = torch.tensor(2., requires_grad=True)
b = a * 3
b.retain_grad()        # keep b's gradient
c = b ** 2
c.backward()
print(a.grad, b.grad)  # tensor(36.) tensor(12.)
`
    },
    {
      id: "a12", tag: "beyond",
      topic: { ko: "no_grad · detach · eval", en: "no_grad · detach · eval" },
      q: {
        ko: "다음 중 옳은 설명은?",
        en: "Which statement is correct?"
      },
      options: [
        {
          ok: true,
          t: { ko: "`torch.no_grad()` 블록 안에서는 그래프가 기록되지 않아 추론·평가에 쓴다", en: "Inside `torch.no_grad()`, no graph is recorded, so it's used for inference" },
          why: {
            ko: "블록 안에서 만든 출력은 `requires_grad=False`가 되어 메모리와 연산이 절약됩니다. 튜토리얼도 같은 '기록 제외' 기능을 하는 컨텍스트 매니저로 소개해요.",
            en: "Outputs created inside the block have `requires_grad=False`, saving memory and compute. The tutorial introduces it as the context manager for exactly this exclusion."
          }
        },
        {
          t: { ko: "평가 모드로 바꾸는 `model.eval()`을 호출하면 기울기 계산도 함께 꺼진다", en: "Switching to evaluation mode with `model.eval()` also turns off gradient computation" },
          why: {
            ko: "흔한 오해입니다. `eval()`은 Dropout·BatchNorm 같은 층의 **동작 모드**만 바꿀 뿐, 기울기 추적은 그대로예요. 평가할 때는 `model.eval()`과 `torch.no_grad()`를 **함께** 씁니다.",
            en: "A common misconception. `eval()` only switches the **behavior mode** of layers like Dropout and BatchNorm; gradient tracking stays on. For evaluation, use `model.eval()` **and** `torch.no_grad()` together."
          }
        },
        {
          t: { ko: "`torch.no_grad()` 블록을 빠져나온 뒤에도 파라미터의 `requires_grad`는 False로 남는다", en: "After leaving a `torch.no_grad()` block, parameters keep `requires_grad=False`" },
          why: {
            ko: "`no_grad`는 블록 안의 연산 기록만 잠시 끌 뿐, 파라미터의 `requires_grad` 속성 자체는 바꾸지 않습니다.",
            en: "`no_grad` only pauses recording for operations inside the block. It never changes a parameter's `requires_grad` attribute."
          }
        },
        {
          t: { ko: "`tensor.detach()`는 데이터를 새 메모리에 복사한 텐서를 돌려준다", en: "`tensor.detach()` returns a copy of the data in new memory" },
          why: {
            ko: "`detach()`는 같은 메모리를 공유하면서 그래프에서만 떨어진 텐서를 돌려줍니다. 복사본이 필요하면 `detach().clone()`을 쓰세요.",
            en: "`detach()` returns a tensor that shares the same memory but is cut off from the graph. For a real copy, use `detach().clone()`."
          }
        }
      ],
      explain: {
        ko: "헷갈리기 쉬운 세 가지:\n- `torch.no_grad()`: 블록 안에서 그래프 기록 OFF (일시적)\n- `tensor.detach()`: 특정 텐서를 그래프에서 분리 (메모리 공유)\n- `model.eval()` / `model.train()`: Dropout·BatchNorm의 동작 모드 전환 (기울기와 무관)\n\n순수 추론만 한다면 `torch.inference_mode()`가 `no_grad()`보다 조금 더 빠른 대안입니다.",
        en: "Three things that are easy to mix up:\n- `torch.no_grad()`: graph recording OFF inside the block (temporary)\n- `tensor.detach()`: cuts one tensor off the graph (shares memory)\n- `model.eval()` / `model.train()`: switches Dropout/BatchNorm behavior (unrelated to gradients)\n\nFor pure inference, `torch.inference_mode()` is a slightly faster alternative to `no_grad()`."
      },
      tryit: `
model = torch.nn.Linear(2, 1)
model.eval()
print(model(torch.ones(1, 2)).requires_grad)       # True: eval() doesn't stop autograd
with torch.no_grad():
    print(model(torch.ones(1, 2)).requires_grad)   # False
print(model.weight.requires_grad)                  # True: unchanged
`
    }
  ]
});
