// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MoveForward is ERC20, Pausable, Ownable {
    constructor() ERC20("MoveForward", "MFW") {
        _mint(msg.sender, 10000000 * 10 ** decimals());
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mint(address _to, uint256 _amount) public onlyOwner {
        _mint(_to, _amount);
    }

    function burn(address _account, uint256 _amount) public onlyOwner {
        _burn(_account, _amount);
    }

    function _beforeTokenTransfer(address _from, address _to, uint256 _amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(_from, _to, _amount);
    }
}
