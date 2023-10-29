exports.addDarurat = async (req, res) => {
  const { id_event, id_ibu, jumlah_kader, jumlah_komunitas, jumlah_sampai } =
    req.body;

  const queryInsert =
    "INSERT INTO darurat_list (id_event, id_ibu, jumlah_kader, jumlah_komunitas, jumlah_sampai) VALUES (?, ?, ?, ?, ?)";
  db.query(
    queryInsert,
    [id_event, id_ibu, jumlah_kader, jumlah_komunitas, jumlah_sampai],
    (error, results) => {
      if (error) {
        return res.status(500).send({ message: error.message });
      }
      res.status(201).send({ message: "Darurat added successfully!" });
    }
  );
};

exports.getDaruratByIdEvent = async (req, res) => {
  const { id_event } = req.params; // Mengambil id_event dari parameter URL

  const querySelect = "SELECT * FROM darurat_list WHERE id_event = ?";

  db.query(querySelect, [id_event], (error, results) => {
    if (error) {
      return res.status(500).send({ message: error.message });
    }

    if (results.length === 0) {
      return res
        .status(404)
        .send({ message: "No data found for the given id_event" });
    }

    res.status(200).send({ data: results });
  });
};

exports.updateStatus = (req, res) => {
  const { role, status, id_pendamping } = req.body;

  // Validasi status
  if (status == null) {
    return res.status(400).send({ message: "Status harus diisi." });
  }

  const statusString = status.toString();
  const id_event = req.params.id_event;

  const checkNewRowQuery =
    "SELECT MAX(id_darurat) as latest_id FROM darurat_list WHERE id_event = ?";

  db.query(checkNewRowQuery, [id_event], (error, results) => {
    if (error) return res.status(500).send({ message: error.message });

    const latest_id = results[0].latest_id;
    const checkStatusCountQuery =
      "SELECT COUNT(*) as count FROM darurat_status WHERE id_pendamping = ? AND status = ? AND id_event = ? AND id_darurat = ?";

    db.query(
      checkStatusCountQuery,
      [id_pendamping, statusString, id_event, latest_id],
      (error, results) => {
        if (error) return res.status(500).send({ message: error.message });

        const count = results[0].count;

        if (
          (statusString === "1" && count >= 1) ||
          (statusString === "2" && count >= 1) ||
          (statusString === "0" && count >= 1)
        ) {
          return res.status(400).send({
            message:
              "Batas perubahan status untuk id_pendamping ini telah tercapai.",
          });
        }

        const queryUpdateStatus =
          "INSERT INTO darurat_status (id_darurat, id_event, id_pendamping, role, status) VALUES (?, ?, ?, ?, ?)";

        db.query(
          queryUpdateStatus,
          [latest_id, id_event, id_pendamping, role, statusString],
          (error, results) => {
            if (error) return res.status(500).send({ message: error.message });

            // Kode untuk memperbarui jumlah di darurat_list
            let columnToUpdate = "";

            if (role === "kader" && statusString === "1") {
              columnToUpdate = "jumlah_kader = jumlah_kader + 1";
            } else if (role === "kader" && statusString === "2") {
              columnToUpdate = "jumlah_sampai = jumlah_sampai + 1";
            } else if (role === "komunitas" && statusString === "1") {
              columnToUpdate = "jumlah_komunitas = jumlah_komunitas + 1";
            } else if (role === "komunitas" && statusString === "2") {
              columnToUpdate = "jumlah_sampai = jumlah_sampai + 1";
            }

            if (columnToUpdate) {
              const queryUpdateList = `UPDATE darurat_list SET ${columnToUpdate} WHERE id_darurat = ?`;

              db.query(queryUpdateList, [latest_id], (error, results) => {
                if (error)
                  return res.status(500).send({ message: error.message });

                res
                  .status(200)
                  .send({ message: "Status berhasil diperbarui!" });
              });
            } else {
              res.status(200).send({
                message:
                  "Status berhasil diperbarui, tetapi tidak ada perubahan pada darurat_list!",
              });
            }
          }
        );
      }
    );
  });
};
