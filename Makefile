# Open the PyTorch Blitz quizzes in your default browser (see quiz.py).
#   make            -> quiz home: chapter quizzes + mixed practice (main.html)
#   make quiz-2     -> chapter 2's quiz
#   make quiz-all   -> every chapter quiz, each in its own tab
PYTHON ?= python3

.DEFAULT_GOAL := quiz
.PHONY: quiz quiz-all help

quiz: ## Open the quiz home (chapter quizzes + mixed practice)
	@$(PYTHON) quiz.py

quiz-all: ## Open every chapter quiz, each in its own tab
	@$(PYTHON) quiz.py all

quiz-%: ## Open one chapter quiz: make quiz-1 ... make quiz-4
	@$(PYTHON) quiz.py $*

help: ## Show available targets
	@grep -E '^[a-zA-Z_%-]+:.*## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "}; {printf "  make %-10s %s\n", $$1, $$2}'
