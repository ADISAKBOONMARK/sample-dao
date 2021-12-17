// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

contract MyGovernor {

    struct Candidate {
        string ipfsUrl;
        uint256 countScore;
    }

    struct Governor {
        bool voted;
        uint256 candidateIndex;
    }

    struct Snapshot {
        uint256 voteStart;
        uint256 voteEnd;
        uint256 lastCandidateIndex;
        bool executed;
        bool canceled;
        mapping (address => Governor) governorList;
        mapping (uint256 => Candidate) candidateList;
    }

    mapping(uint256 => Snapshot) public snapshotList;

    uint256 private lastSnapshotIndex = 0;

    constructor(){}

    function isOpenVote(uint256 snapshotIndex) private view returns(bool result) {
        if(snapshotList[snapshotIndex].executed == false && snapshotList[snapshotIndex].canceled == false) {
            result = true;
        }
        return result;
    }

    function createSnapshot() public {
        snapshotList[lastSnapshotIndex].voteStart = block.timestamp;
        snapshotList[lastSnapshotIndex].voteEnd = block.timestamp + 1 days;
        lastSnapshotIndex++;
    }

    function addCandidate(uint256 snapshotIndex) public {
        require(snapshotIndex < lastSnapshotIndex, "error");

        snapshotList[snapshotIndex].candidateList[snapshotList[snapshotIndex].lastCandidateIndex].ipfsUrl = "";
        snapshotList[snapshotIndex].lastCandidateIndex++;
    }

    function vote(uint256 snapshotIndex, uint256 candidateIndex) public {
        //TODO: This function should allow only members.
        require(snapshotIndex < lastSnapshotIndex, "error");
        require(candidateIndex < snapshotList[snapshotIndex].lastCandidateIndex, "error");
        require(isOpenVote(snapshotIndex), "error");
        require(snapshotList[snapshotIndex].governorList[msg.sender].voted == false, "error");

        snapshotList[snapshotIndex].candidateList[candidateIndex].countScore++;
        snapshotList[snapshotIndex].governorList[msg.sender].candidateIndex = candidateIndex;
        snapshotList[snapshotIndex].governorList[msg.sender].voted = true;
    }

    function execute(uint256 snapshotIndex) public {
        require(snapshotIndex < lastSnapshotIndex, "error");
        require(isOpenVote(snapshotIndex), "error");

        snapshotList[snapshotIndex].executed = true;
    }

    function cancel(uint256 snapshotIndex) public {
        require(snapshotIndex < lastSnapshotIndex, "error");
        require(isOpenVote(snapshotIndex), "error");

        snapshotList[snapshotIndex].canceled = true;
    }

    function voteReport(uint256 snapshotIndex) public view returns(Candidate[] memory) {
        Candidate[] memory result = new Candidate[](snapshotList[snapshotIndex].lastCandidateIndex);

        for(uint256 i = 0; i < snapshotList[snapshotIndex].lastCandidateIndex; i++) {
            result[i] = snapshotList[snapshotIndex].candidateList[i];
        }

        return result;
    }

    function candidateReport(uint256 snapshotIndex, uint256 candidateIndex) public view returns(Candidate memory) {
        return snapshotList[snapshotIndex].candidateList[candidateIndex];
    }

    function myVote(uint256 snapshotIndex) public view returns(Governor memory) {
        return snapshotList[snapshotIndex].governorList[msg.sender];
    }
}
