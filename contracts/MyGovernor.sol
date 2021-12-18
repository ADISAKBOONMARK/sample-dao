// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyGovernor is Ownable{
    //TODO: Handle error cases
    // 50001: error description
    using Counters for Counters.Counter;

    struct Candidate {
        string ipfsUrl;
        Counters.Counter countScore;
    }

    struct Governor {
        bool voted;
        uint256 candidateIndex;
    }

    struct Snapshot {
        uint256 voteStart;
        uint256 voteEnd;
        Counters.Counter lastCandidateIndex;
        bool canceled;
        mapping (address => Governor) governorList;
        mapping (uint256 => Candidate) candidateList;
    }

    struct Snap {
        uint256 voteStart;
        uint256 voteEnd;
        uint256 lastCandidateIndex;
        bool canceled;
    }

    mapping(uint256 => Snapshot) private snapshotList;

    Counters.Counter private lastSnapshotIndex;

    constructor(){}
    
    function getSnapshot(uint256 _snapshotIndex) public view returns(Snap memory) {
        Snap memory snap = Snap({
            voteStart: snapshotList[_snapshotIndex].voteStart,
            voteEnd: snapshotList[_snapshotIndex].voteEnd,
            lastCandidateIndex: snapshotList[_snapshotIndex].lastCandidateIndex.current(),
            canceled: snapshotList[_snapshotIndex].canceled
        });
        return snap;
    }

    function isOpenVote(uint256 snapshotIndex) private view returns(bool result) {
        if(snapshotList[snapshotIndex].voteStart <= block.timestamp && 
        snapshotList[snapshotIndex].voteEnd > block.timestamp) {
            result = true;
        }
    }

    function isCancelVote(uint256 snapshotIndex) private view returns(bool result) {
        result = snapshotList[snapshotIndex].canceled;
    }

    function isFoundSnapshot(uint256 snapshotIndex) private view returns(bool result) {
        if(snapshotIndex < lastSnapshotIndex.current()) {
            result = true;
        }
    }

    function isFoundCandidate(uint256 snapshotIndex, uint256 candidateIndex) private view returns(bool result) {
        if(candidateIndex < snapshotList[snapshotIndex].lastCandidateIndex.current()) {
            result = true;
        }
    }

    function isDuplicateVote(uint256 snapshotIndex, address sender) private view returns(bool result) {
        result = snapshotList[snapshotIndex].governorList[sender].voted;
    }

    function createSnapshot(uint256 _voteStart, uint256 _voteEnd) public onlyOwner {
        require(_voteStart >= block.timestamp, "50001");
        require(_voteStart < _voteEnd, "50002");

        snapshotList[lastSnapshotIndex.current()].voteStart = _voteStart;
        snapshotList[lastSnapshotIndex.current()].voteEnd = _voteEnd;
        lastSnapshotIndex.increment();
    }

    function addCandidate(uint256 _snapshotIndex, string memory _ipfsUrl) public onlyOwner {
        require(isFoundSnapshot(_snapshotIndex), "50003");
        require(!isOpenVote(_snapshotIndex), "50004");
        require(!isCancelVote(_snapshotIndex), "50005");

        snapshotList[_snapshotIndex].candidateList[snapshotList[_snapshotIndex].lastCandidateIndex.current()].ipfsUrl = _ipfsUrl;
        snapshotList[_snapshotIndex].lastCandidateIndex.increment();
    }

    function vote(uint256 _snapshotIndex, uint256 _candidateIndex) public {
        //TODO: This function should allow only members.
        require(isFoundSnapshot(_snapshotIndex), "50003");
        require(isFoundCandidate(_snapshotIndex,_candidateIndex), "50006");
        require(isOpenVote(_snapshotIndex), "50007");
        require(!isCancelVote(_snapshotIndex), "50005");
        require(!isDuplicateVote(_snapshotIndex, msg.sender), "50008");

        snapshotList[_snapshotIndex].candidateList[_candidateIndex].countScore.increment();
        snapshotList[_snapshotIndex].governorList[msg.sender].candidateIndex = _candidateIndex;
        snapshotList[_snapshotIndex].governorList[msg.sender].voted = true;
    }

    function cancel(uint256 _snapshotIndex) public onlyOwner {
        require(isFoundSnapshot(_snapshotIndex), "50003");
        require(isOpenVote(_snapshotIndex), "50007");
        require(!isCancelVote(_snapshotIndex), "50005");

        snapshotList[_snapshotIndex].canceled = true;
    }

    function voteReport(uint256 _snapshotIndex) public view returns(Candidate[] memory) {
        Candidate[] memory result = new Candidate[](snapshotList[_snapshotIndex].lastCandidateIndex.current());

        for(uint256 i = 0; i < snapshotList[_snapshotIndex].lastCandidateIndex.current(); i++) {
            result[i] = snapshotList[_snapshotIndex].candidateList[i];
        }

        return result;
    }

    function candidateReport(uint256 _snapshotIndex, uint256 _candidateIndex) public view returns(Candidate memory) {
        return snapshotList[_snapshotIndex].candidateList[_candidateIndex];
    }

    function myVote(uint256 _snapshotIndex) public view returns(Governor memory) {
        return snapshotList[_snapshotIndex].governorList[msg.sender];
    }
}
