## Open Name Services

**Name Services for the rest of us**

The introduction of ENS has been groundbreaking in terms of mapping payment addresses to a readable (and memorable) domain. In the ever-growing ecosystem of ERC-20 tokens, we believed the same idea could extend to all assets.

It started off with a very simple smart contract for mapping, deployed to the Ropsten test network:

```
pragma solidity ^0.5.10;

contract Open_Name_Registry {

    address[] addresses;
    string[] domains;

    function register(string memory domain) public {
        addresses.push(msg.sender);
        domains.push(domain);
    }

    function lookup(string memory domain) public returns (address add) {
        for (uint i=0; i<domains.length; i++) {
            if (compareStrings(domains[i], domain)){
                return addresses[i];
            }
        }
    }

    function compareStrings (string memory a, string memory b) public view 
       returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))) );
    }
}
```

From here on, work was added as time permitted such as domain hashing and contract-side validation. In the interest of time we chose not to extend ENS, but this is something in the future we'd like to do to further enrich the eco-system.

A client side application was built with React.js to act as the registrar. The app fetches the latest list of ERC-20 tokens and provides their symbol as the TLD, as well as an input field for choosing a name unique to the user. If the name is still available, a user need only pay a small gas fee in ETH to facilitate the registry transaction. After 0 seconds to a minute or two, the user is presented with a success message that indicates their mapping is complete.

As we built this, the motivation to enrich and integrate this with client side providers, such as Brave Crypto Wallets or MetaMask grew. These providers could look out for these ERC-20 domains, call the lookup function in the contract, and facilitate transactions without users needing to know anyone's address. The greatest challenge we faced was time for all of these points of integration. There is certainly more to come in the future!
