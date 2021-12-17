// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/utils/Counters.sol";

contract MyGovernor {
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
        bool executed;
        bool canceled;
        mapping (address => Governor) governorList;
        mapping (uint256 => Candidate) candidateList;
    }

    struct Snap {
        uint256 voteStart;
        uint256 voteEnd;
        uint256 lastCandidateIndex;
        bool executed;
        bool canceled;
    }

    mapping(uint256 => Snapshot) private snapshotList;

    Counters.Counter private lastSnapshotIndex;

    constructor(){}
    
    function getSnapshot(uint256 snapshotIndex) public view returns(Snap memory) {
        Snap memory snap = Snap({
            voteStart: snapshotList[snapshotIndex].voteStart,
            voteEnd: snapshotList[snapshotIndex].voteEnd,
            lastCandidateIndex: snapshotList[snapshotIndex].lastCandidateIndex.current(),
            executed: snapshotList[snapshotIndex].executed,
            canceled: snapshotList[snapshotIndex].canceled
        });
        return snap;
    }

    function isOpenVote(uint256 snapshotIndex) private view returns(bool result) {
        if(snapshotList[snapshotIndex].executed == false && snapshotList[snapshotIndex].canceled == false) {
            result = true;
        }
        return result;
    }

    function createSnapshot() public {
        snapshotList[lastSnapshotIndex.current()].voteStart = block.timestamp;
        snapshotList[lastSnapshotIndex.current()].voteEnd = block.timestamp + 1 days;
        lastSnapshotIndex.increment();
    }

    function addCandidate(uint256 snapshotIndex) public {
        require(snapshotIndex < lastSnapshotIndex.current(), "error");

        snapshotList[snapshotIndex].candidateList[snapshotList[snapshotIndex].lastCandidateIndex.current()].ipfsUrl = "";
        snapshotList[snapshotIndex].lastCandidateIndex.increment();
    }

    function vote(uint256 snapshotIndex, uint256 candidateIndex) public {
        //TODO: This function should allow only members.
        require(snapshotIndex < lastSnapshotIndex.current(), "error");
        require(candidateIndex < snapshotList[snapshotIndex].lastCandidateIndex.current(), "error");
        require(isOpenVote(snapshotIndex), "error");
        require(snapshotList[snapshotIndex].governorList[msg.sender].voted == false, "error");

        snapshotList[snapshotIndex].candidateList[candidateIndex].countScore.increment();
        snapshotList[snapshotIndex].governorList[msg.sender].candidateIndex = candidateIndex;
        snapshotList[snapshotIndex].governorList[msg.sender].voted = true;
    }

    function execute(uint256 snapshotIndex) public {
        require(snapshotIndex < lastSnapshotIndex.current(), "error");
        require(isOpenVote(snapshotIndex), "error");

        snapshotList[snapshotIndex].executed = true;
    }

    function cancel(uint256 snapshotIndex) public {
        require(snapshotIndex < lastSnapshotIndex.current(), "error");
        require(isOpenVote(snapshotIndex), "error");

        snapshotList[snapshotIndex].canceled = true;
    }

    function voteReport(uint256 snapshotIndex) public view returns(Candidate[] memory) {
        Candidate[] memory result = new Candidate[](snapshotList[snapshotIndex].lastCandidateIndex.current());

        for(uint256 i = 0; i < snapshotList[snapshotIndex].lastCandidateIndex.current(); i++) {
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
