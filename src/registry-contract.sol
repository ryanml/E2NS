pragma solidity ^0.5.10;

// Open Name Service 

contract ONS_Alpha {
    
    address[] addresses;
    string[] domains;
    
    function register(string memory domain) public {
        addresses.push(msg.sender);
        domains.push(domain);
    }
    
    function lookup(string memory domain) public view returns (address add) {
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