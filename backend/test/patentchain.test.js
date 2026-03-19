const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("PatentChain contracts", function () {
  describe("PatentRegistry", function () {
    it("registers a document and stores its metadata", async function () {
      const [owner] = await ethers.getSigners()
      const Registry = await ethers.getContractFactory("PatentRegistry")
      const registry = await Registry.deploy()
      await registry.waitForDeployment()

      const hash = ethers.keccak256(ethers.toUtf8Bytes("patent-doc-1"))
      const tx = await registry.registerDocument(hash, "patent.pdf")
      await tx.wait()

      const document = await registry.getDocument(hash)

      expect(await registry.isRegistered(hash)).to.equal(true)
      expect(document.hash).to.equal(hash)
      expect(document.fileName).to.equal("patent.pdf")
      expect(document.owner).to.equal(owner.address)
      expect(document.blockNumber).to.be.gt(0n)
      expect(await registry.totalDocuments()).to.equal(1n)
    })
  })

  describe("Crowdfunding", function () {
    it("creates a project, accepts a contribution, and lets the creator withdraw after success", async function () {
      const [creator, contributor] = await ethers.getSigners()
      const Crowdfunding = await ethers.getContractFactory("Crowdfunding")
      const crowdfunding = await Crowdfunding.deploy()
      await crowdfunding.waitForDeployment()

      const patentHash = ethers.keccak256(ethers.toUtf8Bytes("patent-project-1"))
      const fundingGoal = ethers.parseEther("1")
      const duration = 24 * 60 * 60

      const createTx = await crowdfunding.connect(creator).createProject(
        "AI Energy Patent",
        "Smart energy optimization",
        "AI",
        fundingGoal,
        duration,
        patentHash
      )
      await createTx.wait()

      await crowdfunding.connect(contributor).contribute(1, {
        value: fundingGoal,
      })

      expect(await crowdfunding.getContribution(1, contributor.address)).to.equal(fundingGoal)

      await ethers.provider.send("evm_increaseTime", [duration + 1])
      await ethers.provider.send("evm_mine", [])

      await crowdfunding.connect(creator).withdrawFunds(1)

      const project = await crowdfunding.getProject(1)
      expect(project.amountRaised).to.equal(fundingGoal)
      expect(project.status).to.equal(1n)
      expect(project.fundsWithdrawn).to.equal(true)
    })
  })

  describe("PatentNFT", function () {
    it("mints a patent NFT and indexes it by owner and document hash", async function () {
      const [owner] = await ethers.getSigners()
      const PatentNFT = await ethers.getContractFactory("PatentNFT")
      const patentNFT = await PatentNFT.deploy("PatentChain Patent NFT", "PCPATENT")
      await patentNFT.waitForDeployment()

      const documentHash = ethers.keccak256(ethers.toUtf8Bytes("patent-nft-1"))
      const ipfsHash = "QmTestPatentHash"

      const mintTx = await patentNFT.mintPatentNFT(
        owner.address,
        "Autonomous Delivery System",
        "Patent NFT description",
        documentHash,
        ipfsHash,
        `ipfs://${ipfsHash}`,
        true
      )
      await mintTx.wait()

      const tokenIds = await patentNFT.getPatentsByOwner(owner.address)
      const tokenId = tokenIds[0]
      const metadata = await patentNFT.getPatentMetadata(tokenId)

      expect(await patentNFT.isMinted(documentHash)).to.equal(true)
      expect(await patentNFT.getTokenIdByDocumentHash(documentHash)).to.equal(tokenId)
      expect(metadata.title).to.equal("Autonomous Delivery System")
      expect(metadata.documentHash).to.equal(documentHash)
      expect(await patentNFT.tokenURI(tokenId)).to.equal(`ipfs://${ipfsHash}`)
    })
  })
})
