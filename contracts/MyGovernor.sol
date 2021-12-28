// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyGovernor is Ownable {
    // Handle error cases
    // 50001: Time starts voting is less than the current time.
    // 50002: Time starts voting is greater than or equal to the end time.
    // 50003: Not found a snapshot.
    // 50004: Voting is opening.
    // 50005: Voting is canceled.
    // 50006: Not found a candidate.
    // 50007: Voting ends.
    // 50008: Member duplicates a vote.
    // 50009: Member doesn't have the feature for voting.

    using Counters for Counters.Counter;

    struct Candidate {
        string ipfsUrl; 
        Counters.Counter countScore;
    }

    struct Vote {
        bool voted;
        uint256 candidateIndex;
    }

    struct Snapshot {
        uint256 voteStart;
        uint256 voteEnd;
        uint256 location;
        Counters.Counter lastCandidateIndex;
        bool canceled;
        mapping (address => Vote) voteList;
        mapping (uint256 => Candidate) candidateList;
    }

    struct Snap {
        uint256 voteStart;
        uint256 voteEnd;
        uint256 location;
        uint256 lastCandidateIndex;
        bool canceled;
    }

    struct Member {
        uint256 location;
        bool active;
    }

    Counters.Counter private lastSnapshotIndex;
    mapping(uint256 => Snapshot) private snapshotList;
    
    mapping(address => Member) private memberList;

    constructor(){}

    function isOpenVote(uint256 snapshotIndex) private view returns(bool result) {
        if(snapshotList[snapshotIndex].voteStart <= block.timestamp && 
        snapshotList[snapshotIndex].voteEnd > block.timestamp) {
            result = true;
        }
    }

    function isMemberCanVote(uint256 snapshotIndex, address account) private view returns(bool result) {
        if(memberList[account].location == snapshotList[snapshotIndex].location &&
        memberList[account].active == true) {
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

    function isDuplicateVote(uint256 snapshotIndex, address account) private view returns(bool result) {
        result = snapshotList[snapshotIndex].voteList[account].voted;
    }

    function register(uint256 _location, address account) public onlyOwner {
        //TODO: Change modifier onlyOwner() and used ERC20 to verify.
        memberList[account].location = _location;
        memberList[account].active = true;
    }

    function setLocation(uint256 _location) public {
        memberList[_msgSender()].location = _location;
    }

    function createSnapshot(uint256 _voteStart, uint256 _voteEnd, uint256 _location) public onlyOwner {
        require(_voteStart >= block.timestamp, "50001");
        require(_voteStart < _voteEnd, "50002");

        snapshotList[lastSnapshotIndex.current()].voteStart = _voteStart;
        snapshotList[lastSnapshotIndex.current()].voteEnd = _voteEnd;
        snapshotList[lastSnapshotIndex.current()].location = _location;
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
        require(isMemberCanVote(_snapshotIndex, _msgSender()), "50009");
        require(isFoundSnapshot(_snapshotIndex), "50003");
        require(isFoundCandidate(_snapshotIndex,_candidateIndex), "50006");
        require(isOpenVote(_snapshotIndex), "50007");
        require(!isCancelVote(_snapshotIndex), "50005");
        require(!isDuplicateVote(_snapshotIndex, _msgSender()), "50008");

        snapshotList[_snapshotIndex].candidateList[_candidateIndex].countScore.increment();
        snapshotList[_snapshotIndex].voteList[_msgSender()].candidateIndex = _candidateIndex;
        snapshotList[_snapshotIndex].voteList[_msgSender()].voted = true;

        memberList[_msgSender()].active = false;
    }

    function cancel(uint256 _snapshotIndex) public onlyOwner {
        require(isFoundSnapshot(_snapshotIndex), "50003");
        require(isOpenVote(_snapshotIndex), "50007");
        require(!isCancelVote(_snapshotIndex), "50005");

        snapshotList[_snapshotIndex].canceled = true;
    }

    function getSnapshot(uint256 _snapshotIndex) public view returns(Snap memory) {
        Snap memory snap = Snap({
            voteStart: snapshotList[_snapshotIndex].voteStart,
            voteEnd: snapshotList[_snapshotIndex].voteEnd,
            location: snapshotList[_snapshotIndex].location,
            lastCandidateIndex: snapshotList[_snapshotIndex].lastCandidateIndex.current(),
            canceled: snapshotList[_snapshotIndex].canceled
        });
        return snap;
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

    function myVote(uint256 _snapshotIndex) public view returns(Vote memory) {
        return snapshotList[_snapshotIndex].voteList[_msgSender()];
    }

    function myInfo() public view returns(Member memory) {
        return memberList[_msgSender()];
    }
}
