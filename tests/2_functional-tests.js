const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
	suite("POST request tests", () => {
		test("Create an issue with every field: POST request to /api/issues/{project}", (done) => {
			chai
				.request(server)
				.post("/api/issues/testproject")
				.send({
					issue_title: "Full fields test",
					issue_text: "Full fields test",
					created_by: "Name test",
					assigned_to: "Name test",
					status_text: "Full fields test",
				})
				.end((err, res) => {
					assert.equal(res.status, 200);
					assert.isObject(res.body);
					assert.property(res.body, "_id");
					assert.property(res.body, "issue_title");
					assert.property(res.body, "issue_text");
					assert.property(res.body, "created_by");
					assert.property(res.body, "assigned_to");
					assert.property(res.body, "status_text");
					assert.property(res.body, "created_on");
					assert.property(res.body, "updated_on");
					assert.property(res.body, "project");
					assert.property(res.body, "open");
					assert.property(res.body, "__v");
					done();
				});
		});

		test("Create an issue with only required fields: POST request to /api/issues/{project}", (done) => {
			chai
				.request(server)
				.post("/api/issues/testproject")
				.send({
					issue_title: "Required fields test",
					issue_text: "Required fields test",
					created_by: "Name test",
				})
				.end((err, res) => {
					assert.equal(res.status, 200);
					assert.isObject(res.body);
					assert.property(res.body, "_id");
					assert.property(res.body, "issue_title");
					assert.property(res.body, "issue_text");
					assert.property(res.body, "created_by");
					assert.property(res.body, "assigned_to");
					assert.property(res.body, "status_text");
					assert.property(res.body, "created_on");
					assert.property(res.body, "updated_on");
					assert.property(res.body, "project");
					assert.property(res.body, "open");
					assert.property(res.body, "__v");
					done();
				});
		});

		test("Create an issue with missing required fields: POST request to /api/issues/{project}", (done) => {
			chai
				.request(server)
				.post("/api/issues/testproject")
				.send({
					issue_title: "Missing required fields test",
					issue_text: "Missing required fields test",
				})
				.end((err, res) => {
					assert.equal(res.status, 200);
					assert.isObject(res.body);
					assert.property(res.body, "error");
					done();
				});
		});
	});
	suite("GET requests tests", () => {
		test("View issues on a project: GET request to /api/issues/{project}", (done) => {
			chai
				.request(server)
				.get("/api/issues/testproject")
				.end((err, res) => {
					assert.equal(res.status, 200);
					assert.isArray(res.body);
					done();
				});
		});

		test("View issues on a project with one filter: GET request to /api/issues/{project}", (done) => {
			chai
				.request(server)
				.get("/api/issues/testproject")
				.query({ issue_title: "Required fields test" })
				.end((err, res) => {
					assert.equal(res.status, 200);
					assert.isArray(res.body, "Response should be an array");
					if (res.body.length > 0) {
						res.body.forEach((issue) => {
							assert.property(issue, "issue_title");
							assert.equal(issue.issue_title, "Required fields test");
						});
					}
					done();
				});
		});

		test("View issues on a project with multiple filters: GET request to /api/issues/{project}", (done) => {
			chai
				.request(server)
				.get("/api/issues/testproject")
				.query({ issue_title: "Required fields test", open: true })
				.end((err, res) => {
					assert.equal(res.status, 200);
					assert.isArray(res.body, "Response should be an array");
					if (res.body.length > 0) {
						res.body.forEach((issue) => {
							assert.property(issue, "issue_title");
							assert.property(issue, "open");
							assert.equal(issue.issue_title, "Required fields test");
							assert.equal(issue.open, true);
						});
					}
					done();
				});
		});
	});

	suite("PUT requests tests", () => {
		test("Update one field on an issue: PUT request to /api/issues/{project}", (done) => {
			chai
				.request(server)
				.put("/api/issues/testproject")
				.send({
					_id: "66a01428b2c6d0c627f4a3cd",
					status_text: "Updated status",
				})
				.end((err, res) => {
					console.log(res.body);
					assert.equal(res.status, 200);
					assert.isObject(res.body);
					assert.property(res.body, "_id");
					assert.equal(res.body._id, "66a01428b2c6d0c627f4a3cd");
					done();
				});
		});

		test("Update multiple fields on an issue: PUT request to /api/issues/{project}", (done) => {
			chai
				.request(server)
				.put("/api/issues/testproject")
				.send({
					_id: "66a01428b2c6d0c627f4a3cd",
					status_text: "Multiple updated status",
					issue_title: "Multiple updated issue new title",
				})
				.end((err, res) => {
					console.log(res.body);
					assert.equal(res.status, 200);
					assert.isObject(res.body);
					assert.property(res.body, "_id");
					assert.equal(res.body._id, "66a01428b2c6d0c627f4a3cd");
					done();
				});
		});

		test("Update an issue with missing _id: PUT request to /api/issues/{project}", (done) => {
			chai
				.request(server)
				.put("/api/issues/testproject")
				.send({
					_id: "",
					status_text: "Updated status",
				})
				.end((err, res) => {
					assert.equal(res.status, 200);
					assert.isObject(res.body);
					assert.property(res.body, "error");
					assert.equal(res.body.error, "missing _id");
					done();
				});
		});

		test("Update an issue with no fields to update: PUT request to /api/issues/{project}", (done) => {
			chai
				.request(server)
				.put("/api/issues/testproject")
				.send({
					_id: "66a01428b2c6d0c627f4a3cd",
				})
				.end((err, res) => {
					console.log(res.body);
					assert.equal(res.status, 200);
					assert.isObject(res.body);
					assert.property(res.body, "error");
					assert.property(res.body, "_id");
					assert.equal(res.body.error, "no update field(s) sent");
					assert.equal(res.body._id, "66a01428b2c6d0c627f4a3cd");
					done();
				});
		});

		test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", (done) => {
			chai
				.request(server)
				.put("/api/issues/testproject")
				.send({
					_id: "Invalid issue ID",
					status_text: "Update with invalid id test",
				})
				.end((err, res) => {
					assert.equal(res.status, 200);
					assert.isObject(res.body);
					assert.property(res.body, "error");
					assert.equal(res.body.error, "could not update");
					done();
				});
		});
	});

	suite("DELETE requests tests", () => {
		test("Delete an issue: DELETE request to /api/issues/{project}", (done) => {
			chai
				.request(server)
				.post("/api/issues/testproject")
				.send({
					issue_title: "Delete fields test",
					issue_text: "Delete fields test",
					created_by: "Name test",
				})
				.end((err, res) => {
					assert.equal(res.status, 200);
					assert.isObject(res.body);
					assert.property(res.body, "_id");

					console.log("Id of added issue to delete:", res.body._id);
					chai
						.request(server)
						.delete("/api/issues/testproject")
						.send({
							_id: `${res.body._id}`,
						})
						.end((err, res) => {
							console.log(
								`Issue with _id: ${res.body._id} deleted successfully`
							);
							assert.equal(res.status, 200);
							assert.isObject(res.body);
							assert.property(res.body, "_id");
							done();
						});
				});
		});

		test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", (done) => {
			chai
				.request(server)
				.delete("/api/issues/testproject")
				.send({ _id: "invalid _id" })
				.end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.isObject(res.body);
                    assert.property(res.body, "error");
                    assert.equal(res.body.error, "could not delete");
                    done();
                });
		});

        test("Delete an issue with missing _id: DELETE request to /api/issues/{project}", (done) => {
			chai
				.request(server)
				.delete("/api/issues/testproject")
				.send({ _id: "" })
				.end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.isObject(res.body);
                    assert.property(res.body, "error");
                    assert.equal(res.body.error, "missing _id");
                    done();
                });
		});
	});
});
