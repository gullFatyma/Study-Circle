import Request from "../models/Request.js";

// Create a new request
// @route   POST /api/requests
export const createRequest = async (req, res) => {
  try {
    const { title, description, subject } = req.body;

    if (!title || !subject) {
      return res.status(400).json({ message: "Title and subject are required" });
    }

    const request = await Request.create({
      title,
      description,
      subject,
      postedBy: req.user._id,
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Get all requests (feed) - optional subject filter
// @route   GET /api/requests?subject=OOP
export const getRequests = async (req, res) => {
  try {
    const filter = {};
    if (req.query.subject) {
      filter.subject = req.query.subject;
    }

    const requests = await Request.find(filter)
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single request by ID
// @route   GET /api/requests/:id
export const getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id).populate("postedBy", "name email");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Delete own request
// @route   DELETE /api/requests/:id
export const deleteRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this request" });
    }

    await request.deleteOne();
    res.json({ message: "Request deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};