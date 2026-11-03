import numpy as np
import matplotlib.pyplot as plt
import torch
import torch.optim as optim
import torch.nn as nn
import torch.nn.functional as F
import torchvision
from torchvision.transforms import v2

# torchvision
#   1. Has data loaders for common datasets such as ImageNet, CIFAR10, MNIST.
#   2. Has data transformers for images such as torchivision.datasets and torch.utils.data.DataLoader
#     2.1. torchivision.datasets provides images and labels
#     2.2. torchvision.transforms transforms images
#     2.3. torch.utils.data.DataLoader providers data as a batch


def imshow(img):
    # Unnormalize
    img = img / 2 + 0.5
    np_img = img.numpy()
    plt.imshow(np.transpose(np_img, (1, 2, 0)))
    for idx in range(len(labels)):
         plt.text(2 + idx * 34 + 16, -4, classes[labels[idx]], color='red', fontsize=16, ha='center')    
    plt.show()


transform = v2.Compose(transforms=[
    v2.ToImage(),
    v2.ToDtype(dtype=torch.float32, scale=True),
    v2.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
])

batch_size = 4
trainset = torchvision.datasets.CIFAR10(root="./data", train=True,
                                        download=True, transform=transform)
trainloader = torch.utils.data.DataLoader(dataset=trainset, batch_size=batch_size,
                                          shuffle=True, num_workers=0)

testset = torchvision.datasets.CIFAR10(root="./data", train=False,
                                       download=True, transform=transform)
testloader = torch.utils.data.DataLoader(dataset=testset, batch_size=batch_size,
                                         shuffle=False, num_workers=0)

# ['airplane', 'automobile', 'bird', 'cat', 'deer', 'dog', 'frog', 'horse', 'ship', 'truck']
classes = trainset.classes
print(classes)

data_iter = iter(trainloader)
images, labels = next(data_iter)

imshow(img=torchvision.utils.make_grid(images))


class Net(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(in_channels=3, out_channels=6, kernel_size=5)
        self.pool = nn.MaxPool2d(kernel_size=2, stride=2)
        self.conv2 = nn.Conv2d(in_channels=6, out_channels=16, kernel_size=5)

        self.fc1 = nn.Linear(in_features=16*5*5, out_features=120)
        self.fc2 = nn.Linear(in_features=120, out_features=84)
        self.fc3 = nn.Linear(in_features=84, out_features=10)

    def forward(self, x):
        x = self.pool(F.relu(self.conv1(x)))
        x = self.pool(F.relu(self.conv2(x)))
        x = torch.flatten(x, 1)
        x = F.relu(self.fc1(x))
        x = F.relu(self.fc2(x))
        x = self.fc3(x)
        return x


net = Net()

criterion = nn.CrossEntropyLoss()
optimizer = optim.SGD(net.parameters(), lr=0.001, momentum=0.9)

for epoch in range(2):
    running_loss = 0.0
    for idx, data in enumerate(trainloader):
        inputs, labels = data

        optimizer.zero_grad()
        outputs = net(inputs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item()

        # Print statistics every 200 mini-batches
        if idx % 2000 == 1999:
            print(f"[{epoch + 1}, {idx + 1}] loss: {running_loss / 2000:.3f}")
            running_loss = 0.0

print("Finished Training\n")


PATH = "./cifar_net.pt"
torch.save(net.state_dict(), PATH)


net = Net()
net.load_state_dict(torch.load(PATH, weights_only=True))

dataiter = iter(testloader)
images, labels = next(dataiter)
outputs = net(images)

_, predicted = torch.max(outputs, 1)


# Answer:  cat   ship  ship  airplane
print("Answer: ", " ".join(f"{classes[labels[idx]]:5s}" for idx in range(4)))
# Predicted:  dog   ship  ship  ship 
print("Predicted: ", " ".join(f'{classes[predicted[idx]]:5s}' for idx in range(4)))


correct, total = 0, 0

# We are not training, so we don't need to calculate the gradients for outputs.
with torch.no_grad():
    for data in testloader:
        images, labels = data
        outputs = net(images)
        _, predicted = torch.max(outputs, 1)
        total += labels.size(0)
        correct += (predicted == labels).sum().item()

# Accuracy of the network on the 10000 test images: 55 %
print(f"Accuracy of the network on the 10000 test images: {100 * correct // total} %\n")


correct_pred = {classname: 0 for classname in classes}
total_pred = {classname: 0 for classname in classes}

with torch.no_grad():
    for data in testloader:
        images, labels = data
        outputs = net(images)
        _, predictions = torch.max(outputs, 1)
        for label, prediction in zip(labels, predictions):
            if label == prediction:
                correct_pred[classes[label]] += 1
            total_pred[classes[label]] += 1


"""
Accuracy for class: airplane is 51.5 %
Accuracy for class: automobile is 75.3 %
Accuracy for class: bird  is 43.7 %
Accuracy for class: cat   is 50.3 %
Accuracy for class: deer  is 28.4 %
Accuracy for class: dog   is 45.5 %
Accuracy for class: frog  is 55.1 %
Accuracy for class: horse is 69.3 %
Accuracy for class: ship  is 67.4 %
Accuracy for class: truck is 70.3 %
"""
for classname, correct_count in correct_pred.items():
    accuracy = 100 * float(correct_count) / total_pred[classname]
    print(f"Accuracy for class: {classname:5s} is {accuracy:.1f} %)")

print()

device = torch.device(torch.accelerator.current_accelerator().type
                      if torch.accelerator.is_available() else "cpu")

# MPU
print(f"Device: {device}\n")

net.to(device=device)

# Need to send the inputs and targets at every step to the GPU too
inputs, labels = data[0].to(device=device), data[1].to(device=device)
