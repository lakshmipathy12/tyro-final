// ... existing code ...

exports.updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, department, designation, employeeId } = req.body;

        // Check uniqueness if email/empId changed (omitted for brevity, but recommended in prod)

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                name,
                email,
                role,
                department,
                designation,
                employeeId
            }
        });

        res.status(200).json({ status: 'success', data: updatedUser });
    } catch (error) {
        console.error("Update Employee Error", error);
        res.status(500).json({ message: 'Error updating employee' });
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        // Optional: Check if self-delete
        if (req.user.id === id) {
            return res.status(400).json({ message: 'You cannot delete yourself.' });
        }

        await prisma.user.delete({
            where: { id }
        });

        res.status(200).json({ status: 'success', message: 'Employee deleted successfully' });
    } catch (error) {
        console.error("Delete Employee Error", error);
        res.status(500).json({ message: 'Error deleting employee' });
    }
};
