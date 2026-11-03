import torch
import numpy as np

# Tensors = specialized data structure (similar to arrays and matrices)
# Tensors = similar to NumPy's ndarrays, but runnig on GPUs
# In PyTorch, tensors = input, output, parameters

data = [[1, 2], [3, 4]]
x_data = torch.tensor(data)


np_array = np.array(data)
x_np = torch.from_numpy(np_array)


x_ones = torch.ones_like(x_data)
print(f"Ones Tnesor: \n {x_ones} \n")
"""
Ones Tnesor: 
 tensor([[1, 1],
        [1, 1]]) 
"""

x_rand = torch.rand_like(x_data, dtype=torch.float)
print(f"Random Tensor: \n {x_rand} \n")
"""
Random Tensor: 
 tensor([[0.8640, 0.1241],
        [0.6956, 0.5444]]) 
"""


shape = (2, 3,)
rand_tensor = torch.rand(shape)
print(f"Random Tensor: \n {rand_tensor} \n")
"""
Random Tensor: 
 tensor([[0.8220, 0.4560, 0.1700],
        [0.0176, 0.4647, 0.4816]]) 
"""


ones_tensor = torch.ones(shape)
print(f"Ones Tensor: \n {ones_tensor} \n")
"""
Ones Tensor: 
 tensor([[1., 1., 1.],
        [1., 1., 1.]]) 
"""
      
zeros_tensor = torch.zeros(shape)
print(f"Zeros Tensor: \n {zeros_tensor}")
"""
Zeros Tensor: 
 tensor([[0., 0., 0.],
        [0., 0., 0.]])
"""


tensor = torch.rand(3, 4)
print(f"Shape of tensor: {tensor.shape}")
print(f"Datatype of tensor: {tensor.dtype}")
print(f"Device tensor is stored on: {tensor.device}")


device = torch.accelerator.current_accelerator().type
mpu_tensor = tensor.to(device)
print(f"Device tensor is stored on: {mpu_tensor.device}")


# [:] -> All rows
# [,] -> Separate row and column
# [:,1] -> The second column of all rows
# [:,1] = 0 -> Change the second column of all rows to 0
tensor = torch.ones(4, 4)
print(f"before: ", tensor)
tensor[:,1] = 0
print(f"after: ", tensor)

# dim = 0 -> Connected with rows (4, 4) -> (8, 4)
# dim = 1 -> Connected with columns (4, 4) -> (4, 8)
t0 = torch.cat([tensor, tensor], dim=0)
print("dim=0: ", t0)
t1 = torch.cat([tensor, tensor], dim=1)
print("dim=1: ", t1)


# A.mul(B) == A * B -> Element-wise Multiplication
mtensor = tensor.mul(tensor)
print(mtensor)


# A.matmul(B) == A @ B -> Matrix Multiplication
# Therefore, (m, n) @ (n, p)
# The number of columns of M must be the same of the number of rows of B
mttensor = tensor.matmul(tensor)
print(mttensor)

# add_, mul_ ...
print("before: ", tensor)
tensor.add_(5)
print("`_` means in-place operation: ", tensor)

# A change in the tensor reflects in the NumPy array
t = torch.ones(5)
print("t: ", t)
n = t.numpy()
print("n: ", n)
t.add_(1)
print(f"after add_,\nt: {t}\nand n: {n}")

# Vice versa is True
n = np.ones(5)
t = torch.from_numpy(n)
np.add(n, 1, out=n)
print(f"after add_,\nt: {t}\nand n: {n}")
