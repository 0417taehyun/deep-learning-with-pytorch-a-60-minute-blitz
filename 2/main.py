# torch.autograd -> Automatic differentiation engine that powers neural network training.
# 
# Neural Networks (NNs) -> A Collection of nested functions that are executed on some input data.
#                       -> Functions are defined by parameters (weights, biases)
#                       -> Parameters are stored in tensors in PyTorch
# 
# Training
#  1. Foward: Compute predictions and compare them with targets using a loss function
#  2. Backward: Compute gradients of the loss with respect to parameters
#  3. Optimization: Update parameters using gradients from backward with an optimizer such as Stochastic Gradient Descent (SGD) 

import torch
from torch import nn, optim
from torchvision.models import resnet18, ResNet18_Weights

model = resnet18(weights=ResNet18_Weights)
data = torch.rand(1, 3, 64, 64)
labels = torch.rand(1, 1000)

# Forward
prediction = model(data)

loss = (prediction - labels).sum()

# Backward
loss.backward()

# Optimizer, Stochastic Gradient Descent (SGD)
optimizer = optim.SGD(model.parameters(), lr=1e-2, momentum=0.9)
# Change the parameter of `model` directly
optimizer.step()

# no_grad() means do not store information for gradient, which means no need backward
with torch.no_grad():
    updated_prediction = model(data)

print("Before training loss: ", (prediction - labels).sum().item())
print("After training loss: ", (updated_prediction - labels).sum().item())

# a and b are parameters
a = torch.tensor([2., 3.], requires_grad=True)
b = torch.tensor([6., 4.], requires_grad=True)

# 3a^3 - b^2, and Q is loss, Q = [-12., 65.]
Q = 3*a**3 - b**2
Q.backward(gradient=torch.tensor([1., 1.]))

print(9*a**2 == a.grad)
print(-2*b == b.grad)



# Freez all the parameters of ResNet18 model
model = resnet18(weights=ResNet18_Weights.DEFAULT)
for param in model.parameters():
    param.requires_grad = False

# The classifier is the lat linear layer (Fully Connected layer)
#
# We replace it with a new linear layer that acts as our classifier
#   to finetune the model on a new dataset with 10 labels.
#
# This process is a transfer learning.
model.fc = nn.Linear(in_features=512, out_features=10)
optimizer = optim.SGD(params=model.parameters(), lr=1e-2, momentum=0.9)

"""
torch.no_grad() disables tracking the gradients

with torch.no_grad():
    y = x * 2

This context manager keeps the previous state with self.prev variable.
It restores the previous state when exiting the context.

- tensor.requires_grad -> for each tensor
- torch.set_grad_enable() -> gradient tracking configuration in the thread
"""
class no_grad:
    def __init__(self) -> None:
        super().__init__()
        self.prev = False

    def __enter__(self) -> None:
        self.prev = torch.is_grad_enabled()
        torch.set_grad_enabled(False)

    def __exit__(self, **kwargs) -> None:
        torch.set_grad_enabled(self.prev)    
