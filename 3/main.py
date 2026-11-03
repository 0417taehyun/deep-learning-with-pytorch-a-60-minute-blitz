import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim


# The Net class below follows the LesNet architecture.
class Net(nn.Module):
    def __init__(self):
        super().__init__()

        # Kernels
        #   - in_channels=1 means that the inputs are grayscale images
        self.conv1 = nn.Conv2d(in_channels=1, out_channels=6, kernel_size=5)
        self.conv2 = nn.Conv2d(in_channels=6, out_channels=16, kernel_size=5)

        # Affine operation: y= Wx + b
        self.fc1 = nn.Linear(in_features=16*5*5, out_features=120)
        self.fc2 = nn.Linear(in_features=120, out_features=84)
        self.fc3 = nn.Linear(in_features=84, out_features=10)

    def forward(self, input):
        # Convolution Layer C1
        #   - 1 Input image channel, 6 output channels, 5x5 square convolution, ReLU activate function
        #   - If input image size is 32x32, the output Tensor size is (N, 6, 28, 28) where N is a batch size
        #     - output_height = ((input_height - kernel_size) / stride) + 1 -> ((32 - 5) / 1) + 1 = 28
        #     - output_width = ((input_width - kernel_size) / stride) + 1   -> ((32 - 5) / 1) + 1 = 28
        c1 = F.relu(self.conv1(input))

        # Subsampling layer S2 with 2x2 grid
        #   - Use maximum value in each 2x2 grid
        #   - If input image size is 28x28, the output Tensor size is (N, 6, 14, 14)
        s2 = F.max_pool2d(input=c1, kernel_size=(2, 2))

        # Convolution Layer C3
        #   - 6 Input image channel, 16 output channels, 5x5 square convolution, ReLU activate function
        #   - If input image size is 14x14, the output Tensor size is (N, 16, 10, 10)
        c3 = F.relu(self.conv2(s2))

        # Subsampling layer S4 with 2x2 grid
        #   - Use maximum value in each 2x2 grid
        #   - If input image size is 10x10, the output Tensor size is (N, 16, 5, 5)
        s4 = F.max_pool2d(input=c3, kernel_size=(2, 2))

        # Flatten, the output Tensor size is (N, 16*5*5) = (N, 400)
        s4 = torch.flatten(s4, start_dim=1)

        # Fully connected layer F5
        #   - Input Tensor isze is (N, 400)
        #   - Output Tensor size is (N, 120)
        f5 = F.relu(self.fc1(s4))

        # Fully connected layer F6
        #   - Input Tensor isze is (N, 120)
        #   - Output Tensor size is (N, 84)
        f6 = F.relu(self.fc2(f5))

        # Fully connected layer output
        #   - Input Tensor isze is (N, 84)
        #   - Output Tensor size is (N, 10)
        output = self.fc3(f6)
        return output


net = Net()

"""Net(
  (conv1): Conv2d(1, 6, kernel_size=(5, 5), stride=(1, 1))
  (conv2): Conv2d(6, 16, kernel_size=(5, 5), stride=(1, 1))
  (fc1): Linear(in_features=400, out_features=120, bias=True)
  (fc2): Linear(in_features=120, out_features=84, bias=True)
  (fc3): Linear(in_features=84, out_features=10, bias=True)
)
"""
print(net)

print()

params = list(net.parameters())

# 10 (5 leanable layers, and each layer has weight and bias, so 5*2=10)
print(len(params))

# conv1's weight: torch.Size([6, 1, 5, 5])
print(params[0].size())

print()

# If image.shape = (1, 32, 32), and want to use the network, we need to add a batch dimension.
# So the input shape should be (1, 1, 32, 32) and use input.unsqueeze(0) to add a fake batch dimension.
input = torch.rand(1, 1, 32, 32)
out = net(input)
print(out, out.shape)

print()

# Zero the gradients
net.zero_grad()
# Backward pass
out.backward(torch.rand(1, 10))

print()

output = net(input)         # shape: (1, 10)
# N refers normal distribution
target = torch.randn(10)    # shape: (10, )
target = target.view(1, -1) # shape: (1, 10)
criterion = nn.MSELoss()

loss = criterion(output, target)
print(loss)

# MSELoss <MseLossBackward0 object at 0x10c8a7e50>
print(loss.grad_fn)     

# Linear <AddmmBackward0 object at 0x10c043d00>
# next_functions looks like ((previous_node_A, number), (previous_node_B, number), ...)
#   - We use the first previous node, next_functions[0][0]
#   - The first previous node is the Linear Layer (FC Layer)
#   - Addmm means add + matrix multiplication, which is the operation in the Linear Layer
#     - y = Wx + b (wx is matrix multiplication, and b is add)
print(loss.grad_fn.next_functions[0][0])

# AccumulateGrad <AccumulateGrad object at 0x10ba82530>
#   - AccumulateGrad means accumulate gradient
print(loss.grad_fn.next_functions[0][0].next_functions[0][0]) 

# ReLU <ReluBackward0 object at 0x10d9ba080>
print(loss.grad_fn.next_functions[0][0].next_functions[1][0]) 

print()

net.zero_grad()

print('conv1.bias.grad before backward')
print(net.conv1.bias.grad)  # None

loss.backward()

print('conv1.bias.grad after backward')
print(net.conv1.bias.grad)  # tensor([-0.0023,  0.0098,  0.0000, -0.0094,  0.0103,  0.0201])

print()

inputs = torch.randn(100, 1, 32, 32)
targets = torch.ones(100 ,10)
dataset = torch.utils.data.TensorDataset(inputs, targets)
trainloader = torch.utils.data.DataLoader(dataset=dataset, batch_size=10,
                                          shuffle=True, num_workers=0)

# Use Stochastic Gradient Descent (SGD) to update the parameters of the network
net = Net()
criterion = nn.MSELoss()
optimizer = optim.SGD(net.parameters(), lr=0.01)

# 5 Epochs of training
for epoch in range(1, 6):
    total_loss = 0.0
    for input, target in trainloader:
        # input size: (10, 1, 32, 32), target size: (10, 10)

        optimizer.zero_grad()
        output = net(input)
        loss = criterion(output, target)
        loss.backward()
        optimizer.step()

        total_loss += loss.item()

    print(f"Epoch: {epoch}, Loss: {total_loss / len(trainloader)}")
