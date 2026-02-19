from rest_framework import serializers
from .models import Employee, Attendance


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ['id', 'employee_id', 'full_name', 'email', 'department', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_employee_id(self, value):
        if not value.strip():
            raise serializers.ValidationError("Employee ID cannot be blank.")
        return value.strip()

    def validate_full_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Full name cannot be blank.")
        return value.strip()

    def validate_department(self, value):
        if not value.strip():
            raise serializers.ValidationError("Department cannot be blank.")
        return value.strip()

    def validate(self, attrs):
        # Check uniqueness on create/update (excluding self on update)
        instance = self.instance
        employee_id = attrs.get('employee_id', getattr(instance, 'employee_id', None))
        email = attrs.get('email', getattr(instance, 'email', None))

        qs_id = Employee.objects.filter(employee_id=employee_id)
        qs_email = Employee.objects.filter(email=email)

        if instance:
            qs_id = qs_id.exclude(pk=instance.pk)
            qs_email = qs_email.exclude(pk=instance.pk)

        if qs_id.exists():
            raise serializers.ValidationError(
                {"employee_id": f"An employee with ID '{employee_id}' already exists."}
            )
        if qs_email.exists():
            raise serializers.ValidationError(
                {"email": f"An employee with email '{email}' already exists."}
            )
        return attrs


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
        read_only_fields = ['id', 'created_at', 'employee_name', 'employee_id_display', 'department']

    def validate_status(self, value):
        if value not in ['Present', 'Absent']:
            raise serializers.ValidationError("Status must be 'Present' or 'Absent'.")
        return value

    def validate(self, attrs):
        employee = attrs.get('employee', getattr(self.instance, 'employee', None))
        date = attrs.get('date', getattr(self.instance, 'date', None))

        qs = Attendance.objects.filter(employee=employee, date=date)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
            raise serializers.ValidationError(
                {"detail": f"Attendance for this employee on {date} already exists. Use update instead."}
            )
        return attrs
