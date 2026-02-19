from rest_framework import serializers
from .models import Employee, Attendance


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ['id', 'employee_id', 'full_name', 'email', 'department', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_employee_id(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Employee ID cannot be blank.")
        return value

    def validate_email(self, value):
        return value.strip().lower()


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_id_display = serializers.CharField(source='employee.employee_id', read_only=True)
    department = serializers.CharField(source='employee.department', read_only=True)

    class Meta:
        model = Attendance
        fields = [
            'id', 'employee', 'employee_name', 'employee_id_display',
            'department', 'date', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'employee_name', 'employee_id_display', 'department', 'created_at']

    def validate(self, data):
        employee = data.get('employee')
        date = data.get('date')
        instance = self.instance  # set during updates

        qs = Attendance.objects.filter(employee=employee, date=date)
        if instance:
            qs = qs.exclude(pk=instance.pk)
        if qs.exists():
            raise serializers.ValidationError(
                "An attendance record for this employee on this date already exists."
            )
        return data
