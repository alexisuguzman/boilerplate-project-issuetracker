"use strict";

const mongoDB = require("mongodb");
const mongoose = require("mongoose");

module.exports = function (app) {
	mongoose.connect(process.env.MONGODB_URI);

	const issueSchema = new mongoose.Schema({
		issue_title: { type: String, required: true },
		issue_text: { type: String, required: true },
		created_by: { type: String, required: true },
		assigned_to: { type: String },
		status_text: { type: String },
		created_on: { type: Date, required: true },
		updated_on: { type: Date, required: true },
		open: { type: Boolean, required: true, default: true },
		project: { type: String },
	});

	const Issue = mongoose.model("Issue", issueSchema);

	app
		.route("/api/issues/:project")

		.get(async function (req, res) {
			let project = req.params.project;

			let query = { project: project };
			if (req.query) {
				query = { project: project, ...req.query };
			}

			try {
				const issues = await Issue.find(query);
				res.json(issues);
			} catch (err) {
				res.send(err);
				return;
			}
		})

		.post(async function (req, res) {
			let project = req.params.project;

			if (req.body.issue_title && req.body.issue_text && req.body.created_by) {
				const newIssue = new Issue({
					issue_title: req.body.issue_title,
					issue_text: req.body.issue_text,
					created_by: req.body.created_by,
					assigned_to: req.body.assigned_to || "",
					status_text: req.body.status_text || "",
					created_on: new Date(),
					updated_on: new Date(),
					open: true,
					project: project,
				});

				try {
					const doc = await newIssue.save();
					console.log("Document saved successfully");
					res.send(doc);
				} catch (err) {
					if (err instanceof mongoose.Error.ValidationError) {
						res.send({ error: "required field(s) missing" });
					} else {
						res.send("Error Saving Document");
					}
				}
			} else {
				res.send({ error: "required field(s) missing" });
				return;
			}
		})

		.put(async function (req, res) {
			let project = req.params.project;
			const { _id, ...updateData } = req.body;

			if (!_id) {
				console.log({ error: "missing _id" });
				res.send({ error: "missing _id" });
				return;
			}

			if (Object.keys(updateData).length === 0) {
				console.log({ error: "no update field(s) sent", _id: _id });
				res.send({ error: "no update field(s) sent", _id: _id });
				return;
			}

			try {
				const doc = await Issue.findByIdAndUpdate(
					_id,
					{ updateData, updated_on: new Date() },
					{ new: true }
				);
				if (!doc) {
					res.send({ error: "could not update", _id: _id });
					console.log({ error: "could not update", _id: _id });
				} else {
					res.send({ result: "successfully updated", _id: _id });
				}
			} catch (err) {
				res.send({ error: "could not update", _id: _id });
				console.log({ error: "could not update", _id: _id });
			}
		})

		.delete(async function (req, res) {
			let project = req.params.project;
			const _id = req.body._id;

			if (!_id) {
				console.log({ Message: "DELETE fail", error: "missing _id" });
				res.send({ error: "missing _id" });
				return;
			}

			try {
				const doc = await Issue.findByIdAndDelete(_id, { new: true });
				if (!doc) {
					console.log({ error: "could not delete", _id: _id });
					res.send({ error: "could not delete", _id: _id });
				} else {
					res.send({ result: "successfully deleted", _id: _id });
				}
			} catch (err) {
				res.send({ error: "could not delete", _id: _id });
			}
		});
};
