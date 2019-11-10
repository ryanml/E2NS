export const abi = [
  {
      "constant": true,
      "inputs": [
          {
              "internalType": "string",
              "name": "a",
              "type": "string"
          },
          {
              "internalType": "string",
              "name": "b",
              "type": "string"
          }
      ],
      "name": "compareStrings",
      "outputs": [
          {
              "internalType": "bool",
              "name": "",
              "type": "bool"
          }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
  },
  {
      "constant": false,
      "inputs": [
          {
              "internalType": "string",
              "name": "domain",
              "type": "string"
          }
      ],
      "name": "register",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "constant": true,
      "inputs": [
          {
              "internalType": "string",
              "name": "domain",
              "type": "string"
          }
      ],
      "name": "lookup",
      "outputs": [
          {
              "internalType": "address",
              "name": "add",
              "type": "address"
          }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
  }
]
