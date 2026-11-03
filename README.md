# Deep Learning with PyTorch: A 60 Minute Blitz

> You can check the full content via [official website](https://docs.pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html)

## Table of Contents

- [Tensors](./1/README.md)
- [A Gentle Introduction to torch.autograd](./2/README.md)
- [Neural Networks](./4/README.md)
- [Training a Classifier](./3/README.md)

## Quiz Execution

```bash
make quiz
```

This opens the quiz home page (`main.html`) in your default browser. From there you can pick a chapter quiz or start a mixed practice session.

| Command                       | What it opens                                 |
| ----------------------------- | --------------------------------------------- |
| `make` / `make quiz`          | Quiz home: chapter quizzes + mixed practice   |
| `make quiz-1` … `make quiz-4` | One chapter's quiz directly                   |
| `make quiz-all`               | All four chapter quizzes, each in its own tab |
| `make help`                   | List of available targets                     |

The Makefile is a thin wrapper around `quiz.py`, which only uses the Python standard library, so you can also run it directly:

```bash
python3 quiz.py          # quiz home
python3 quiz.py 2        # chapter 2's quiz
python3 quiz.py all      # every chapter quiz
python3 quiz.py --print  # print the URLs without opening a browser
```

You can also just open `main.html` (or any `N/quiz.html`) in a browser. No server or build step is needed.
